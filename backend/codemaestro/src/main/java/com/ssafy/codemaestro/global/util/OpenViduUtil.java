package com.ssafy.codemaestro.global.util;

import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import io.openvidu.java.client.OpenViduRole;
import org.springframework.stereotype.Component;

@Component
public class OpenViduUtil {
    public OpenViduRole determineRole(User participant, Conference conference) {
        return conference.getOwner().getId().equals(participant.getId())
                ? OpenViduRole.MODERATOR
                : OpenViduRole.PUBLISHER;
    }

    public boolean isModerator(User participant, Conference conference) {
        return conference.getOwner().getId().equals(participant.getId());
    }
}
