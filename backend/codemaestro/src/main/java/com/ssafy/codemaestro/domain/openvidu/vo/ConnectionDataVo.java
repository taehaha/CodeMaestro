package com.ssafy.codemaestro.domain.openvidu.vo;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Builder
public class ConnectionDataVo {
    String userId;
    String nickname;
    String profileImageUrl;
    String description;

    public String toJson() {
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("userId", userId);
        jsonObject.addProperty("nickname", nickname);
        jsonObject.addProperty("profileImageUrl", profileImageUrl);
        jsonObject.addProperty("description", description);

        return jsonObject.toString();
    }

    public static ConnectionDataVo fromJson(String json) {
        Gson gson = new Gson();
        return gson.fromJson(json, ConnectionDataVo.class);
    }

    @Override
    public String toString() {
        return "ConnectionDataVo{" +
                "userId='" + userId + '\'' +
                ", nickname='" + nickname + '\'' +
                ", profileImageUrl='" + profileImageUrl + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
