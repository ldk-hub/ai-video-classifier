package com.nexus.classifier.video.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoFileRepository extends JpaRepository<VideoFile, Long> {
    boolean existsByOriginalName(String originalName);
    List<VideoFile> findByIsLowQualityTrue();
    List<VideoFile> findByStatusOrderByCreatedAtDesc(VideoStatus status);

    // Rule 2: pgvector Native Query & Cosine Similarity Order By
    // ?1 is an array or string payload like '[0.1, 0.2, ...]'
    @Query(value = "SELECT * FROM video_files ORDER BY ai_embedding <=> cast(:embedding as vector) LIMIT :limit", nativeQuery = true)
    List<VideoFile> findSimilarVideos(@Param("embedding") String embedding, @Param("limit") int limit);
}
