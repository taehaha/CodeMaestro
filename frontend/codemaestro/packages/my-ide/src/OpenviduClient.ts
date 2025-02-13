// OpenviduClient.ts
import axios, { AxiosInstance } from "axios";
import { OpenVidu, Publisher, Session, StreamManager, Connection } from "openvidu-browser";

interface ConnectionData {
  userId?: number;
  nickname?: string;
  profileImageUrl?: string;
  description?: string;
}

type SubscriberCallback = (subscriber: StreamManager) => void;

class OpenviduClient {
  private OV: OpenVidu;
  private AXIOS: AxiosInstance;
  private session: Session;
  private connections: Connection[] = [];
  private publisher!: Publisher;
  private subscribers: StreamManager[] = [];
  private connectionData: ConnectionData = {};
  private OnSubscriberAdded: SubscriberCallback = () => {};
  private OnSubscriberDeleted: SubscriberCallback = () => {};
  private OnMessageReceived: (userId: number, nickname: string, message: string) => void = () => {};

  // Map to store each subscriber's video element reference
  private subscriberVideoElements: Map<StreamManager, HTMLVideoElement> = new Map();

  /**
   * Openvidu Custom SDK for Codemaestro!!!
   * @param HOST_URL URL 객체 (예: new URL("https://your-openvidu-server.com/"))
   * @param ACCESS_TOKEN 현재 유저의 ACCESS TOKEN
   * @param conferenceId 회의실 번호
   */
  constructor(HOST_URL: URL, ACCESS_TOKEN: string, conferenceId: number) {
    this.OV = new OpenVidu();
    this.AXIOS = axios.create({
      baseURL: HOST_URL.href + "conference/" + conferenceId,
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        "access": ACCESS_TOKEN,
      },
    });
    this.session = this.OV.initSession();

    // 새로운 참가자가 입장하면 구독(subscriber) 등록
    this.session.on("streamCreated", ({ stream }) => {
      const subscriber = this.session.subscribe(stream, undefined);
      
      // 구독자가 생성한 video element를 이벤트로 받아서 Map에 저장
      subscriber.on("videoElementCreated", (evt) => {
        const videoElem = evt.element as HTMLVideoElement;
        // 예: 미리 지정된 컨테이너가 있으면 append
        const container = document.getElementById("remote-video-container");
        if (container) {
          container.appendChild(videoElem);
        }
        this.subscriberVideoElements.set(subscriber, videoElem);
      });

      this.subscribers.push(subscriber);
      this.OnSubscriberAdded(subscriber);
    });

    // 참가자가 떠나면 구독 해제 및 video element 제거
    this.session.on("streamDestroyed", ({ stream }) => {
      const index = this.subscribers.findIndex(
        (sub) => sub === stream.streamManager
      );
      if (index >= 0) {
        const subscriber = this.subscribers[index];
        this.subscribers.splice(index, 1);
        this.OnSubscriberDeleted(subscriber);
        // Map에 저장된 video element를 찾아 DOM에서 제거
        const videoElem = this.subscriberVideoElements.get(subscriber);
        if (videoElem && videoElem.parentNode) {
          videoElem.parentNode.removeChild(videoElem);
        }
        this.subscriberVideoElements.delete(subscriber);
      }
    });

    // 참가자가 연결되면 connection 정보를 저장
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

    // 오류 발생 시 로그 출력
    this.session.on("exception" as any, (event: any) => {
      console.warn("OpenviduClient 오류 발생:", event.exception);
    });

    // 채팅 수신
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
  }

  // 연결 초기화 메서드
  async initConnection(
    accessCode: number,
    video: boolean,
    audio: boolean
  ): Promise<void> {
    try {
      // Connection Token 얻기
      const response = await this.AXIOS.post("/issue-token", {
        accessCode: accessCode ? accessCode : null,
      });
      const connectionToken: string = response.data.connectionToken;
      await this.session.connect(connectionToken);
      this.connectionData = JSON.parse(this.session.connection.data);

      // 내 웹캠 및 마이크 송출
      this.publisher = this.OV.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: video,
        publishVideo: audio,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });
      this.session.publish(this.publisher);

      // 이미 연결된 참가자들 구독
      const remoteStreamManagers = this.session.streamManagers.filter(
        (manager) => manager.remote
      );
      remoteStreamManagers.forEach((manager) => {
        this.connections.push(manager.stream.connection);
        const subscriber = this.session.subscribe(manager.stream, undefined);
        // 구독자의 video element를 직접 추가하는 처리
        subscriber.on("videoElementCreated", (evt) => {
          const videoElem = evt.element as HTMLVideoElement;
          const container = document.getElementById("remote-video-container");
          if (container) {
            container.appendChild(videoElem);
          }
          this.subscriberVideoElements.set(subscriber, videoElem);
        });
        this.subscribers.push(subscriber);
      });
    } catch (err) {
      console.error("연결에 실패했습니다.", err);
      throw err;
    }
  }

  // 메세지 전송 메서드
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

  // 메시지 수신 콜백 설정
  setMessageReceivedCallback(
    callback: (userId: number, nickname: string, message: string) => void
  ): void {
    this.OnMessageReceived = callback;
  }

  // 참가자 목록 반환
  gerParticipantList(): ConnectionData[] {
    return this.connections.map((connection) => JSON.parse(connection.data));
  }

  // 연결 종료 메서드
  disconnect(): void {
    this.session.disconnect();
  }

  // 내 웹캠, 마이크 제어 메서드들
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

  // 구독자 목록 반환
  getSubscribers(): StreamManager[] {
    return [...this.subscribers];
  }

  // 내가 송출중인 객체 반환
  getMyPublisher(): Publisher {
    return this.publisher;
  }

  // 현재 사용자의 ID를 반환하는 메서드 추가
  getMyUserId(): number {
    return this.connectionData.userId !== undefined ? this.connectionData.userId : 0;
  }

  // 방장 관리 메서드
  manageModerator(userId: number): void {
    this.AXIOS.patch("/moderator/" + userId).catch((err) => {
      console.error("방장 변경 중 오류 발생:", err);
    });
  }

  // 참가자 강제 퇴장 메서드
  manageKickParticipant(userId: number): void {
    this.AXIOS.delete("/user/" + userId)
      .then(() => {
        console.log("추방 성공. 대상:", userId);
      })
      .catch((err) => {
        console.error("추방 중 에러 발생:", err);
      });
  }

  // 참가자 Publish 상태 조정
  manageParticipantPublishStatus(
    userId: number,
    offVideo: boolean,
    offAudio: boolean
  ): void {
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
}

export default OpenviduClient;
