package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.domain.group.entity.GroupJoinRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class GroupJoinRequestDto {
    private Long userId;
    private Long groupId;
    private String message;

    // 필요 시 엔티티로 변환하는 메서드
    public static GroupJoinRequestDto from(GroupJoinRequest entity) {
        if (entity == null || entity.getUser() == null || entity.getGroup() == null) {
            throw new IllegalArgumentException("Entity, User, or Group cannot be null");
        }

        return new GroupJoinRequestDto(
                entity.getUser().getId(),
                entity.getGroup().getId(),
                entity.getMessage()
        );
    }
}
