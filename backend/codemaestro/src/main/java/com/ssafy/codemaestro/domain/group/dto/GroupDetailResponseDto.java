package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.domain.group.entity.Group;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
public class GroupDetailResponseDto {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerNickname;
    private Integer currentMembers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GroupMemberResponseDto> members; // 그룹 멤버 리스트

    public GroupDetailResponseDto(Group group) {
        this.id = group.getId();
        this.name = group.getName();
        this.description = group.getDescription();
        this.ownerId = group.getOwner().getId();
        this.ownerNickname = group.getOwner().getNickname();
        this.currentMembers = group.getCurrentMembers();
        this.createdAt = group.getCreatedAt();
        this.updatedAt = group.getUpdatedAt();

        this.members = group.getMembers().stream()
                .map(GroupMemberResponseDto::new)
                .collect(Collectors.toList());
    }
}
