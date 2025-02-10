package com.ssafy.codemaestro.domain.openvidu.vo;

public enum OpenviduSignalType {
    UNPUBLISH_VIDEO("unpublish-video"),
    UNPUBLISH_AUDIO("unpublish-audio"),
    MODERATOR_CHANGED("moderator-changed");

    private final String type;

    OpenviduSignalType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return type;
    }
}
