package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.global.entity.GroupMember;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
public class GroupMemberResponseDto {
    private Long userId;
    private String userNickname;
    private String profileImageUrl;
    private String role;
    private LocalDateTime joinedAt;

    public GroupMemberResponseDto(GroupMember groupMember) {
        this.userId = groupMember.getUser().getId();
        this.userNickname = groupMember.getUser().getNickname();
        this.profileImageUrl = groupMember.getUser().getProfileImageUrl();
        this.role = groupMember.getRole().name();
        this.joinedAt = groupMember.getJoinedAt();
    }
}
