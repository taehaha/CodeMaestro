package com.ssafy.codemaestro.domain.openvidu.vo;

public enum OpenviduSignalType {
    UNPUBLISH_VIDEO("signal:unpublish-video"),
    UNPUBLISH_AUDIO("signal:unpublish-audio"),
    MODERATOR_CHANGED("signal:moderator-changed");

    private final String type;

    OpenviduSignalType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return type;
    }
}
