import axios, { AxiosInstance, AxiosResponse } from "axios";
import UserAxios from "./api/userAxios";
import {
  OpenVidu,
  Publisher,
  Stream,
  Subscriber,
  Session,
  StreamManager,
  Connection,
  ExceptionEvent,
  SignalEvent,
} from "openvidu-browser";

interface ConnectionData {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  description: string;
}

interface Message {
  userId: number;
  nickname: string;
  message: string;
}

class OpenviduClient {
  // 라이브러리 인스턴스
  private OV: OpenVidu = new OpenVidu();
  private OVScreen: OpenVidu = new OpenVidu();
  private AXIOS: AxiosInstance;

  // 필드
  private sessionId: number;
  private session: Session; // 현재 유저 세션
  private screenShareSession: Session; // 화면공유용 세션
  private connectionDatas: ConnectionData[] = []; // 연결된 유저의 데이터들
  private myConnectionData: ConnectionData = {
    // 현재 유저 데이터
    userId: 0,
    nickname: "not init",
    profileImageUrl: "not init",
    description: "not init",
  };
  private isModerator: boolean = false; // 현재 유저가 방장인지 확인

  // 영상 송수신 stream 객체들
  private screenStreamManager: StreamManager | null = null;
  private publisher!: Publisher; // 나중에 할당됨
  private subscribers: Subscriber[] = [];

  // 클래스 사용자가 설정한 Callback 함수들
  private OnSubscriberAdded: (subscriber: Subscriber) => void = () => {};
  private OnSubscriberDeleted: (subscriber: Subscriber) => void = () => {};
  private OnMessageReceived: (
    userId: number,
    nickname: string,
    message: string
  ) => void = () => {};
  private OnScreenAdded: (screen: Publisher | Subscriber) => void = () => {};
  private OnScreenDeleted: (screen: Publisher | Subscriber) => void = () => {};
  private OnModeratorChanged: (newModeratorId: number) => void = () => {};

  private async waitForStreamReady(stream: Stream): Promise<Stream> {
    console.log("스트림 대기중");

    if (stream.hasVideo) {
      return stream;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await this.waitForStreamReady(stream);
    }
  }

  /**
   * Openvidu Custom SDK for Codemaestro!!!
   * 보규보규 정보규 형님을 위한 Openvidu SDK wrapper Class
   * @author 1231724-김태영
   * @param HOST_URL URL 객체
   * @param ACCESS_TOKEN 현재 유저의 ACCESS TOKEN
   * @param conferenceId 회의실 번호
   */
  constructor(HOST_URL: URL, ACCESS_TOKEN: string, conferenceId: number) {
    // this.AXIOS = axios.create({
    //   baseURL: HOST_URL.href + "conference/" + conferenceId,
    //   timeout: 1000,
    //   headers: {
    //     "Content-Type": "application/json",
    //     access: ACCESS_TOKEN,
    //   },
    // });
    this.AXIOS = UserAxios;
    this.sessionId = conferenceId;

    this.session = this.OV.initSession();
    this.screenShareSession = this.OVScreen.initSession();

    // 새로운 참가자가 입장하면 화면과 오디오를 띄우기 위해 새로운 publish를 구독함
    this.session.on("streamCreated", ({ stream }: { stream: Stream }) => {
      if (stream.typeOfVideo === "CAMERA" && stream.hasVideo) {
        console.log("웹캠 스트림 생성됨");
        this.waitForStreamReady(stream).then((stream) => {
          const subscriber = this.session.subscribe(stream, undefined);
          this.subscribers.push(subscriber);
          this.OnSubscriberAdded(subscriber);
        });
      }
    });
    this.screenShareSession.on(
      "streamCreated",
      ({ stream }: { stream: Stream }) => {
        if (stream.typeOfVideo === "SCREEN" && stream.hasVideo) {
          console.log("스크린 스트림 생성됨");
          const screenSubscriber: Subscriber =
            this.screenShareSession.subscribe(stream, undefined);
          this.screenStreamManager = screenSubscriber;
          this.OnScreenAdded(screenSubscriber);
        }
      }
    );

    // 참가자가 떠나면 publish 구독을 해제함
    this.session.on("streamDestroyed", ({ stream }: { stream: Stream }) => {
      if (stream.typeOfVideo === "CAMERA") {
        console.log("웹캠 스트림 제거됨");
        const index = this.subscribers.indexOf(
          stream.streamManager as Subscriber
        );
        if (index >= 0) {
          const subscriber = this.subscribers[index];
          this.subscribers.splice(index, 1);
          this.session.unsubscribe(subscriber);
          this.OnSubscriberDeleted(subscriber);
        }
      }
    });
    this.screenShareSession.on(
      "streamDestroyed",
      ({ stream }: { stream: Stream }) => {
        if (stream.typeOfVideo === "SCREEN") {
          console.log("스크린 스트림 제거됨");
          this.screenShareSession.unsubscribe(
            stream.streamManager as Subscriber
          );
          const screenSubscriber = this.screenStreamManager;
          this.screenStreamManager = null;
          if (screenSubscriber && screenSubscriber instanceof Subscriber) {
            this.OnScreenDeleted(screenSubscriber);
          }
        }
      }
    );

    // 새로운 참가자가 입장하면 참가자 연결 정보를 저장함
    this.session.on(
      "connectionCreated",
      ({ connection }: { connection: Connection }) => {
        if (connection.data) {
          console.log("새로운 사용자가 들어옴");
          const newConnectionData: ConnectionData = JSON.parse(
            connection.data
          ) as ConnectionData;

          if (
            newConnectionData.userId !==
            JSON.parse(this.session.connection.data).userId
          ) {
            this.connectionDatas.push(newConnectionData);
          }
        }
      }
    );

    this.session.on(
      "connectionDestroyed",
      ({ connection }: { connection: Connection }) => {
        if (connection.data) {
          console.log("사용자가 제거됨");

          const removedConnectionData: ConnectionData = JSON.parse(
            connection.data
          ) as ConnectionData;
          const index = this.connectionDatas.findIndex(
            (connectionData) =>
              connectionData.userId === removedConnectionData.userId
          );
          if (index >= 0) {
            this.connectionDatas.splice(index, 1);
          }
        }
      }
    );

    // 내가 송출하는 video를 중지하라는 명령이 들어오는 경우 실행
    this.session.on("signal:unpublish-video", () => {
      console.log("내 웹캠 강제 종료됨");
      this.publisher.publishVideo(false);
    });

    // 내가 송출하는 audio를 중지하라는 명령이 들어오는 경우 실행
    this.session.on("signal:unpublish-audio", () => {
      console.log("내 마이크 강제 종료됨");
      this.publisher.publishAudio(false);
    });

    // 채팅이 수신되면 실행. 데이터는 userId, nickname, message가 data로 들어옴
    this.session.on("signal:message", (signalEvent: any) => {
      console.log("메세지 수신됨");
      const data = JSON.parse(signalEvent.data);
      this.OnMessageReceived(data.userId, data.nickname, data.message);
    });

    // 방장이 나로 바뀔 경우
    this.session.on("signal:moderator-changed", (signalEvent: SignalEvent) => {
      this.isModerator = true;
      this.OnModeratorChanged(this.myConnectionData.userId);
    });

    this.session.on("sessionDisconnected", (event) => {
      if (process.env.REACT_APP_FRONTEND_URL) {
        window.location.href="meeting";
        this.session.disconnect();
      }
    })

    // 오류 발생하면 로그 찍어줌
    this.session.on("exception", (event: ExceptionEvent) => {
      console.warn("OpenviduClient 오류 발생 " + event.message);
    });
  }

  /* public methods */

  /**
   * 회의실 연결하기
   * @param accessCode 방 비밀번호
   * @param video 웹캠 초기 상태
   * @param audio 마이크 초기 상태
   */
  async initConnection(
    accessCode: string | null,
    video: boolean,
    audio: boolean
  ): Promise<void> {
    // Connection Token 얻기
    const response: AxiosResponse<any> = await this.AXIOS.post(
      `/conference/${this.sessionId}/issue-token`,
      {
        accessCode: accessCode ? accessCode : null,
      }
    );

    const connectionToken: string = response.data.connectionToken;
    const screenShareConnectionToken: string =
      response.data.screenShareConnectionToken;

    // Connection 과 데이터 얻기
    await this.session.connect(connectionToken);
    
    this.myConnectionData = JSON.parse(
      this.session.connection.data
    ) as ConnectionData;

    await this.screenShareSession.connect(screenShareConnectionToken);
    this.isModerator = response.data.moderator;

    // 웹캠 및 마이크 송출하기
    this.publisher = this.OV.initPublisher(undefined, {
      audioSource: undefined, // 기본 설정 적용
      videoSource: undefined, // 기본 설정 적용
      publishVideo: video,
      publishAudio: audio,
      resolution: "320x240",
      frameRate: 15,
      insertMode: "APPEND",
      mirror: false,
    });

    this.session.publish(this.publisher);

    console.log("OPENVIDU 초기화 완료됨");

    return;
  }

  /**
   * subscriber가 추가될 경우 실행될 callback 함수 등록
   * @param callback callback(subscriber)
   */
  setSubscriberAddedCallback(callback: (subscriber: Subscriber) => void): void {
    this.OnSubscriberAdded = callback;
  }

  /**
   * subscriber가 제거될 경우 실행될 callback 함수 등록
   * @param callback callback(subscriber)
   */
  setSubscriberDeletedCallback(
    callback: (subscriber: Subscriber) => void
  ): void {
    this.OnSubscriberDeleted = callback;
  }

  /**
   * 새로운 메세지가 수신될 경우 실행될 callback 함수 등록
   * @param callback callback(userId, nickname, message)
   */
  setMessageReceivedCallback(
    callback: (userId: number, nickname: string, message: string) => void
  ): void {
    this.OnMessageReceived = callback;
  }

  /**
   * 스크린 공유가 켜지면 실행될 callback 함수 등록
   * @param callback callback(screenSubscriber)
   */
  setScreenAddedCallback(
    callback: (screenSubscriber: Subscriber | Publisher) => void
  ): void {
    this.OnScreenAdded = callback;
  }

  /**
   * 스크린 공유가 꺼지면 실행될 callback 함수 등록
   * @param callback callback(screenSubscriber)
   */
  setScreenDeletedCallback(
    callback: (screenSubscriber: Subscriber | Publisher) => void
  ): void {
    this.OnScreenDeleted = callback;
  }

  /**
   * 사용자가 변경될 겨웅
   * @param callback callback(newModeratorId)
   */
  setModeratorChangedCallback(
    callback: (newModeratorId: number) => void
  ): void {
    this.OnModeratorChanged = callback;
  }

  /**
   * 모든 참가자의 정보를 가져옵니다.
   * @returns 참가자의 데이터 배열
   */
  gerParticipantDatas(): ConnectionData[] {
    return this.connectionDatas;
  }

  /**
   * Openvidu 접속을 종료합니다.
   */
  disconnect(): void {
    this.session.disconnect();
    this.screenShareSession.disconnect();
  }

  /**
   * 내 스크린을 공유합니다.
   */
  publishMyScreen(): void {
    console.log("내 스크린 공유 시작");

    if (this.screenStreamManager === null) {
      const publisher: Publisher = this.OVScreen.initPublisher(undefined, {
        videoSource: "screen",
        publishVideo: true,
        publishAudio: false,
      });
      this.screenStreamManager = publisher;

      this.screenShareSession.publish(publisher).then(() => {
        // 스크린 공유가 종료될 때 처리
        const mediaStream = this.screenStreamManager!.stream.getMediaStream();
        const videoTracks = mediaStream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTracks[0].addEventListener("ended", () => {
            console.log("내 스크린 공유 ended 실행됨");

            if (this.screenStreamManager instanceof Publisher) {
              this.OnScreenDeleted(this.screenStreamManager);

              this.screenShareSession.unpublish(this.screenStreamManager);
              this.screenStreamManager = null;
            }
          });
        }

        this.OnScreenAdded(publisher);
      });
    } else {
      console.log("이미 누군가 스크린을 공유중입니다.");
    }
  }

  /**
   * 내 웹캠을 킵니다.
   */
  publishMyVideo(): void {
    this.publisher.publishVideo(true);
  }

  /**
   * 내 마이크를 킵니다.
   */
  publishMyAudio(): void {
    this.publisher.publishAudio(true);
  }

  /**
   * 내 스크린 공유를 끕니다.
   */
  unpublishMyScreen(): void {
    console.log("내 스크린 공유 끄기");

    if (
      this.screenStreamManager &&
      this.screenStreamManager instanceof Publisher
    ) {
      this.screenShareSession.unpublish(this.screenStreamManager);
      this.OnScreenDeleted(this.screenStreamManager);

      this.screenStreamManager = null;
    }
  }

  /**
   * 내 웹캠을 끕니다.
   */
  unpublishMyVideo(): void {
    this.publisher.publishVideo(false);
  }

  /**
   * 내 마이크를 끕니다.
   */
  unpublishMyAudio(): void {
    this.publisher.publishAudio(false);
  }

  /**
   * 구독중인 구독 객체(Subscriber)를 반환합니다. Deep copy임.
   * @returns Subscriber 객체 배열
   */
  getSubscribers(): Subscriber[] {
    return this.subscribers;
  }

  /**
   * 내가 송출중인 객체(Publisher)를 반환합니다.
   * @returns Publisher 객체
   */
  getMyPublisher(): Publisher {
    return this.publisher;
  }

  getMyConnectionData(): ConnectionData {
    return this.myConnectionData;
  }

  /**
   * 현재 송출중인 스크린 스트림을 반환합니다.
   * @returns StreamManager 객체 또는 null
   */
  getScreenStreamManager(): StreamManager | null {
    return this.screenStreamManager;
  }

  getIsModerator(): Boolean {
    return this.isModerator;
  }

  /**
   * 채팅 메시지를 보냅니다.
   * Openvidu의 Signal을 활용하여 접속해있는 모든 클라이언트에
   * {userId, nickname, message}가 전달됨
   * @param message 채팅 메시지
   */
  sendMessage(message: string): void {
    const data: Message = {
      userId: this.myConnectionData.userId,
      nickname: this.myConnectionData.nickname,
      message,
    };

    // 상대방 추가
    const connections: Connection[] = this.subscribers.map(
      (subscriber: Subscriber) => subscriber.stream.connection
    );

    // 나 추가
    connections.push(this.publisher.stream.connection);

    this.session.signal({
      data: JSON.stringify(data),
      to: connections,
      type: "message",
    });
  }

  /**
   * 방장이 참가자를 강제로 내보냅니다.
   * @param userId 내보낼 참가자 유저 번호
   */
  manageKickParticipant(userId: number): void {
    this.AXIOS.delete(`/conference/${this.session.sessionId}/user/${userId}`)
      .then(() => {
        console.log("추방 성공. 추방된 유저 정보 :" + userId);
      })
      .catch((err) => {
        console.error("추방 중 에러 발생 : " + err);
      });
  }

  /**
   * 방장이 참가자 웹캠의 Publish 상태를 조절합니다.
   * @param userId
   */
  manageParticipantVideoOff(userId: number) {
    this.AXIOS.delete(`/conference/${this.session.sessionId}/video/${userId}`)
      .then(() => {
        console.log("웹캠 끄기 성공. 대상 : " + userId);
      })
      .catch((err) => {
        console.error("웹캠 끄기 중 에러 발생 : " + err);
      });
  }

  /**
   * 방장이 참가자 오디오의 Publish 상태를 조절합니다.
   * @param userId
   */
  manageParticipantAudioOff(userId: number) {
    this.AXIOS.delete(`/conference/${this.session.sessionId}/audio/${userId}`)
      .then(() => {
        console.log("마이크 끄기 성공. 대상 : " + userId);
      })
      .catch((err) => {
        console.error("마이크 끄기 중 에러 발생 : " + err);
      });
  }

  /**
   * 회의실 정보를 업데이트합니다.
   * @param title 제목
   * @param description 설명
   * @param accessCode 비밀번호
   * @param thumbnailFile 썸네일 파일
   */
  manageUpdateConferenceInfo(
    title: string,
    description: string,
    accessCode: string,
    thumbnailFile: File
  ): void {
    console.log("회의실 내용 변경");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("accessCode", accessCode);
    formData.append("thumbnailFile", thumbnailFile);

    this.AXIOS.put(`/conference/${this.session.sessionId}`, formData, {
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

  /**
   * 방장을 변경합니다.
   * @param userId 방장이 될 참가자 유저 번호
   */
  manageChangeModerator(targetUserId: number) {
    console.log("방장 변경");

    this.AXIOS.patch(
      `/conference/${this.session.sessionId}/moderator/${targetUserId}`
    )
      .then(() => {
        console.log("방장 변경 성공");
        this.isModerator = false;
        this.OnModeratorChanged(targetUserId);
      })
      .catch(() => {
        console.error("방장 변경 실패");
      });
  }
}

export { OpenviduClient };
export type { ConnectionData };
