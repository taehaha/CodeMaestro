// OpenviduClient.ts
import axios, { AxiosInstance } from "axios";
import { OpenVidu, Publisher, Session, Subscriber, StreamManager, Connection } from "openvidu-browser";

interface ConnectionData {
  userId?: number;
  nickname?: string;
  profileImageUrl?: string;
  description?: string;
}

type SubscriberCallback = (subscriber: Subscriber) => void;
type MessageCallback = (userId: number, nickname: string, message: string) => void;
// 로컬 화면 공유(Publisher)와 원격 화면 공유(Subscriber)를 모두 전달할 수 있도록 union 타입으로 지정
type ScreenCallback = (screenStream: Publisher | Subscriber) => void;

class OpenviduClient {
  // 일반 영상/오디오용 OpenVidu 인스턴스
  private OV: OpenVidu;
  // 화면 공유 전용 OpenVidu 인스턴스
  private OVScreen: OpenVidu;
  private AXIOS: AxiosInstance;
  private session: Session;
  private screenShareSession: Session;
  private connections: Connection[] = [];
  private publisher!: Publisher;
  // 구독자(Subscriber) 배열
  private subscribers: Subscriber[] = [];
  
  // 로컬 화면 공유 (내가 송출하는 화면 공유) Publisher
  private localScreenPublisher: Publisher | null = null;
  // 원격 화면 공유 (다른 사용자가 송출하는 화면 공유) Subscriber
  private remoteScreenSubscriber: Subscriber | null = null;
  
  private connectionData: ConnectionData = {};

  // 콜백 함수들
  private OnSubscriberAdded: SubscriberCallback = () => {};
  private OnSubscriberDeleted: SubscriberCallback = () => {};
  private OnMessageReceived: MessageCallback = () => {};
  private OnScreenAdded: ScreenCallback = () => {};
  private OnScreenDeleted: ScreenCallback = () => {};

  // 각 구독자의 video element를 저장하는 Map (필요 시 React 컴포넌트에서 활용할 수 있도록)
  private subscriberVideoElements: Map<Subscriber, HTMLVideoElement> = new Map();

  /**
   * Openvidu Custom SDK for Codemaestro!!!
   * @param HOST_URL URL 객체 (예: new URL("https://your-openvidu-server.com/"))
   * @param ACCESS_TOKEN 현재 유저의 ACCESS TOKEN
   * @param conferenceId 회의실 번호
   */
  constructor(HOST_URL: URL, ACCESS_TOKEN: string, conferenceId: number) {
    this.OV = new OpenVidu();
    this.OVScreen = new OpenVidu();

    this.AXIOS = axios.create({
      baseURL: HOST_URL.href + "conference/" + conferenceId,
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        "access": ACCESS_TOKEN,
      },
    });

    // 일반 세션과 화면 공유 세션 초기화
    this.session = this.OV.initSession();
    this.screenShareSession = this.OVScreen.initSession();

    // ── 일반 스트림 이벤트 ───────────────────────────────
    // 새로운 참가자의 스트림이 생성되면 (카메라)
    this.session.on("streamCreated", ({ stream }) => {
      // 일반 카메라 스트림의 경우 (typeOfVideo가 없거나 "CAMERA")
      if (stream.typeOfVideo === "CAMERA" || !stream.typeOfVideo) {
        console.log("카메라 스트림 생성됨");
        const subscriber = this.session.subscribe(stream, undefined) as Subscriber;
        // video element 생성 시 React 컴포넌트에서 활용할 수 있도록 처리
        subscriber.on("videoElementCreated", (evt) => {
          const videoElem = evt.element as HTMLVideoElement;
          // DOM 직접 조작 대신 videoElem을 내부 Map에 저장
          this.subscriberVideoElements.set(subscriber, videoElem);
          // 필요하다면 여기서 추가 콜백 호출(예: this.OnSubscriberAdded(subscriber))를 할 수 있음
        });
        this.subscribers.push(subscriber);
        // 콜백을 통해 React 컴포넌트에 subscriber 객체 전달
        this.OnSubscriberAdded(subscriber);
      }
    });

    // 스트림 제거 시 처리 (카메라)
    this.session.on("streamDestroyed", ({ stream }) => {
      console.log("스트림 제거됨");
      
      const index = this.subscribers.findIndex(
        (sub) => sub === stream.streamManager
      );
      if (index >= 0) {
        const subscriber = this.subscribers[index];
        this.subscribers.splice(index, 1);
        this.OnSubscriberDeleted(subscriber);
        this.subscriberVideoElements.delete(subscriber);
      }
    });

    // 연결 관련 이벤트
    this.session.on("connectionCreated", ({ connection }) => {
      console.log("사용자가 연결됨:", connection);
      this.connections.push(connection);
    });

    // 내 웹캠, 마이크 강제 종료 명령 처리
    this.session.on("unpublish-video" as any, () => {
      console.log("내 웹캠 강제 종료됨");
      this.publisher.publishVideo(false);
    });
    this.session.on("unpublish-audio" as any, () => {
      console.log("내 마이크 강제 종료됨");
      this.publisher.publishAudio(false);
    });

    // 오류 발생 시
    this.session.on("exception" as any, (event: any) => {
      console.warn("OpenviduClient 오류 발생:", event.exception);
    });

    // 채팅 메시지 수신 처리
    this.session.on("signal:message", (signalEvent) => {
      try {
        const data = signalEvent.data ? JSON.parse(signalEvent.data) : {};
        const userId = data.userId !== undefined ? data.userId : 0;
        const nickname = data.nickname || "익명";
        const message = data.message || "";
        this.OnMessageReceived(userId, nickname, message);
      } catch (error) {
        console.error("채팅 메시지 파싱 중 에러 발생:", error);
      }
    });

    // ── 화면 공유 관련 이벤트 (screenShareSession) ───────────────────────────────
    // 원격 화면 공유 스트림이 생성되면
    this.screenShareSession.on("streamCreated", ({ stream }) => {
      if (stream.typeOfVideo === "SCREEN") {
        console.log("원격 스크린 스트림 생성됨");
        const screenSubscriber = this.screenShareSession.subscribe(stream, undefined) as Subscriber;
        this.remoteScreenSubscriber = screenSubscriber;
        this.OnScreenAdded(screenSubscriber);
      }
    });

    // 원격 화면 공유 스트림 제거 시 처리
    this.screenShareSession.on("streamDestroyed", ({ stream }) => {
      if (stream.typeOfVideo === "SCREEN") {
        console.log("원격 스크린 스트림 제거됨");
        if (this.remoteScreenSubscriber) {
          this.screenShareSession.unsubscribe(this.remoteScreenSubscriber);
          this.OnScreenDeleted(this.remoteScreenSubscriber);
          this.remoteScreenSubscriber = null;
        }
      }
    });
  }

  /**
   * 회의실 연결하기
   * @param accessCode 방 비밀번호
   * @param video 웹캠 초기 상태
   * @param audio 마이크 초기 상태
   */
  async initConnection(accessCode: number, video: boolean, audio: boolean): Promise<void> {
    try {
      // 백엔드에서 일반 토큰과 화면 공유 토큰 함께 받음
      const response = await this.AXIOS.post("/issue-token", {
        accessCode: accessCode ? accessCode : null,
      });
      const connectionToken: string = response.data.connectionToken;
      const screenShareConnectionToken: string = response.data.screenShareConnectionToken;

      // 일반 세션 연결 및 데이터 저장
      await this.session.connect(connectionToken);
      this.connectionData = JSON.parse(this.session.connection.data);

      // 화면 공유 세션 연결
      await this.screenShareSession.connect(screenShareConnectionToken);

      // 내 웹캠 및 마이크 송출
      this.publisher = this.OV.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: audio,
        publishVideo: video,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });
      this.session.publish(this.publisher);

      // 이미 연결된 원격 스트림 구독
      const remoteStreamManagers = this.session.streamManagers.filter(manager => manager.remote);
      remoteStreamManagers.forEach(manager => {
        if (manager.stream.typeOfVideo === "CAMERA" || !manager.stream.typeOfVideo) {
          this.connections.push(manager.stream.connection);
          const subscriber = this.session.subscribe(manager.stream, undefined) as Subscriber;
          subscriber.on("videoElementCreated", (evt) => {
            const videoElem = evt.element as HTMLVideoElement;
            // DOM 조작 없이 내부 Map에 저장 (React 컴포넌트에서 subscriber 정보를 활용)
            this.subscriberVideoElements.set(subscriber, videoElem);
          });
          this.subscribers.push(subscriber);
        } else if (manager.stream.typeOfVideo === "SCREEN") {
          console.log("최초 원격 스크린 공유 감지됨");
          const screenSubscriber = this.screenShareSession.subscribe(manager.stream, undefined) as Subscriber;
          this.remoteScreenSubscriber = screenSubscriber;
        }
      });
    } catch (err) {
      console.error("연결에 실패했습니다.", err);
      throw err;
    }
  }

  /**
   * 메시지 전송 메서드 (Signal 사용)
   * @param message 전송할 메시지
   */
  sendMessage(message: string): void {
    const data = {
      userId: this.connectionData.userId,
      nickname: this.connectionData.nickname,
      message,
    };
    this.session
      .signal({
        data: JSON.stringify(data),
        type: "message",
      })
      .catch((err) => {
        console.error("메시지 전송 중 에러 발생:", err);
      });
  }

  /**
   * 메시지 수신 콜백 설정
   */
  setMessageReceivedCallback(callback: MessageCallback): void {
    this.OnMessageReceived = callback;
  }

  /**
   * subscriber 추가 시 콜백 등록
   */
  setSubscriberAddedCallback(callback: SubscriberCallback): void {
    this.OnSubscriberAdded = callback;
  }

  /**
   * subscriber 제거 시 콜백 등록
   */
  setSubscriberDeletedCallback(callback: SubscriberCallback): void {
    this.OnSubscriberDeleted = callback;
  }

  /**
   * 화면 공유 시작 시 콜백 등록
   */
  setScreenAddedCallback(callback: ScreenCallback): void {
    this.OnScreenAdded = callback;
  }

  /**
   * 화면 공유 종료 시 콜백 등록
   */
  setScreenDeletedCallback(callback: ScreenCallback): void {
    this.OnScreenDeleted = callback;
  }

  /**
   * 모든 참가자의 정보 반환
   */
  gerParticipantList(): ConnectionData[] {
    return this.connections.map((connection) => JSON.parse(connection.data));
  }

  /**
   * 연결 종료 (일반 세션 및 화면 공유 세션 모두)
   */
  disconnect(): void {
    this.session.disconnect();
    this.screenShareSession.disconnect();
  }

  // ── 내 영상/오디오 제어 ─────────────────────────────
  publishMyVideo(): void {
    this.publisher.publishVideo(true);
  }

  publishMyAudio(): void {
    this.publisher.publishAudio(true);
  }

  unpublishMyVideo(): void {
    this.publisher.publishVideo(false);
  }

  unpublishMyAudio(): void {
    this.publisher.publishAudio(false);
  }

  /**
   * 현재 구독중인 subscriber 목록 반환
   */
  getSubscribers(): StreamManager[] {
    return [...this.subscribers];
  }

  /**
   * 내가 송출중인 Publisher 반환
   */
  getMyPublisher(): Publisher {
    return this.publisher;
  }

  /**
   * 현재 화면 공유 스트림 반환 (로컬 화면 공유 또는 원격 화면 공유)
   */
  getScreenStream(): Publisher | Subscriber | null {
    return this.localScreenPublisher || this.remoteScreenSubscriber;
  }

  /**
   * 현재 사용자의 ID 반환
   */
  getMyUserId(): number {
    return this.connectionData.userId !== undefined ? this.connectionData.userId : 0;
  }

  // ── 관리 기능 ─────────────────────────────
  manageModerator(userId: number): void {
    this.AXIOS.patch("/moderator/" + userId).catch((err) => {
      console.error("방장 변경 중 오류 발생:", err);
    });
  }

  manageKickParticipant(userId: number): void {
    this.AXIOS.delete("/user/" + userId)
      .then(() => {
        console.log("추방 성공. 대상:", userId);
      })
      .catch((err) => {
        console.error("추방 중 에러 발생:", err);
      });
  }

  manageParticipantPublishStatus(userId: number, offVideo: boolean, offAudio: boolean): void {
    if (!offVideo) {
      this.AXIOS.delete("/video/" + userId)
        .then(() => {
          console.log("웹캠 끄기 성공. 대상:", userId);
        })
        .catch((err) => {
          console.error("웹캠 끄기 중 에러 발생:", err);
        });
    }
    if (!offAudio) {
      this.AXIOS.delete("/audio/" + userId)
        .then(() => {
          console.log("마이크 끄기 성공. 대상:", userId);
        })
        .catch((err) => {
          console.error("마이크 끄기 중 에러 발생:", err);
        });
    }
  }

  /**
   * 내 화면 공유 시작 (로컬 화면 공유)
   */
  publishMyScreen(): void {
    console.log("내 스크린 공유 시작");
    if (!this.localScreenPublisher) {
      // 로컬 화면 공유 publisher 생성 (DOM element를 직접 지정하지 않음)
      const publisher = this.OVScreen.initPublisher(undefined, {
        videoSource: "screen",
        publishVideo: true,
        publishAudio: false,
      });
      this.localScreenPublisher = publisher;

      this.screenShareSession
        .publish(publisher)
        .then(() => {
          // 브라우저에서 화면 공유가 중단되면 'ended' 이벤트 발생 → 종료 처리
          publisher.stream.getMediaStream().getVideoTracks()[0].addEventListener("ended", () => {
            console.log("내 스크린 공유 ended 실행됨");
            this.OnScreenDeleted(publisher);
            this.unpublishMyScreen();
          });
          this.OnScreenAdded(publisher);
        })
        .catch((err) => {
          console.error("화면 공유 시작 중 에러 발생:", err);
        });
    } else {
      console.log("이미 누군가 스크린을 공유중입니다.");
    }
  }

  /**
   * 내 화면 공유 종료 (로컬 화면 공유)
   */
  unpublishMyScreen(): void {
    console.log("내 스크린 공유 끄기");
    if (this.localScreenPublisher) {
      this.screenShareSession.unpublish(this.localScreenPublisher);
      this.localScreenPublisher = null;
    }
  }

  /**
   * 회의실 정보 업데이트
   * @param title 제목
   * @param description 설명
   * @param accessCode 비밀번호
   * @param thumbnailFile 썸네일 파일 (File 객체)
   */
  manageUpdateConferenceInfo(title: string, description: string, accessCode: string, thumbnailFile: File): void {
    console.log("회의실 내용 변경");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("accessCode", accessCode);
    formData.append("thumbnailFile", thumbnailFile);
    this.AXIOS.put("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        console.log("회의실 내용 변경 완료!");
      })
      .catch(() => {
        console.error("회의실 내용 변경에 실패함 ㅠㅠ");
      });
  }
}

export default OpenviduClient;
