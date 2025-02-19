package com.ssafy.codemaestro.domain.studyRecord.repository;

import com.ssafy.codemaestro.global.entity.StudyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyRecordRepository extends JpaRepository<StudyRecord, Long> {
    Optional<StudyRecord> findByConferenceMemberHistory_Id(Long historyId);
}
