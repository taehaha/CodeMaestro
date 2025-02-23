package com.ssafy.codemaestro.domain.group.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransferOwnerRequestDto {
    private Long groupId;         // 그룹 ID
    private Long currentOwnerId;  // 현재 그룹장 ID
    private Long newOwnerId;      // 새로운 그룹장 ID
}
