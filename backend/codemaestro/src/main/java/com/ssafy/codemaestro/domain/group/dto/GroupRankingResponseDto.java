package com.ssafy.codemaestro.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupRankingResponseDto {
    private Long groupId;
    private String groupName;
    private double totalScore; // 한달간 누적된 일별 참여율 점수
    private int totalMembers; // 그룹 전체 인원 수
    private int averageParticipants; // 평균 참여 인원 수

}
