package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.global.entity.Group;
import lombok.*;

@Getter @Setter
public class GroupResponseDto {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerNickname;
    private Integer currentMembers;

    public GroupResponseDto(Group group) {
        this.id = group.getId();
        this.name = group.getName();
        this.description = group.getDescription();
        this.ownerId = group.getOwner().getId();
        this.ownerNickname = group.getOwner().getNickname();
        this.currentMembers = group.getCurrentMembers();
    }
}