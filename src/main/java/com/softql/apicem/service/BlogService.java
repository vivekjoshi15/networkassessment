/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.service;

import com.softql.apicem.DTOUtils;
import com.softql.apicem.domain.Comment;
import com.softql.apicem.domain.Post;
import com.softql.apicem.exception.ResourceNotFoundException;
import com.softql.apicem.model.CommentDetails;
import com.softql.apicem.model.CommentForm;
import com.softql.apicem.model.PostDetails;
import com.softql.apicem.model.PostForm;
import com.softql.apicem.repository.CommentRepository;
import com.softql.apicem.repository.PostRepository;
import com.softql.apicem.repository.PostSpecifications;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

/**
 *
 * @author 
 */
@Service
@Transactional
public class BlogService {

    private static final Logger log = LoggerFactory.getLogger(BlogService.class);

    @Inject
    private PostRepository postRepository;

    @Inject
    private CommentRepository commentRepository;

    public Page<PostDetails> searchPostsByCriteria(String q, Post.Status status, Pageable page) {
        if (log.isDebugEnabled()) {
            log.debug("search posts by keyword@" + q + ", page @" + page);
        }

        Page<Post> posts = postRepository.findAll(PostSpecifications.filterByKeywordAndStatus(q, status),
                page);

        if (log.isDebugEnabled()) {
            log.debug("get posts size @" + posts.getTotalElements());
        }

        return DTOUtils.mapPage(posts, PostDetails.class);
    }

    public PostDetails savePost(PostForm form) {
        if (log.isDebugEnabled()) {
            log.debug("save post @" + form);
        }

        Post post = DTOUtils.map(form, Post.class);

        Post saved = postRepository.save(post);

        if (log.isDebugEnabled()) {
            log.debug("saved post id is @" + saved);
        }

        return DTOUtils.map(post, PostDetails.class);

    }

    public void updatePost(Long id, PostForm form) {
        Assert.notNull(id, "post id can not be null");

        if (log.isDebugEnabled()) {
            log.debug("update post @" + form);
        }

        Post post = postRepository.findOne(id);
        DTOUtils.mapTo(form, post);

        Post saved = postRepository.save(post);

        if (log.isDebugEnabled()) {
            log.debug("updated post@" + saved);
        }
    }

    public PostDetails findPostById(Long id) {
        Assert.notNull(id, "post id can not be null");

        if (log.isDebugEnabled()) {
            log.debug("find post by id@" + id);
        }

        Post post = postRepository.findOne(id);

        if (post == null) {
            throw new ResourceNotFoundException(id);
        }

        return DTOUtils.map(post, PostDetails.class);
    }

    public Page<CommentDetails> findCommentsByPostId(Long id, Pageable page) {
        if (log.isDebugEnabled()) {
            log.debug("find comments by post id@" + id);
        }

        Page<Comment> comments = commentRepository.findByPostId(id, page);

        if (log.isDebugEnabled()) {
            log.debug("found results@" + comments.getTotalElements());
        }

        return DTOUtils.mapPage(comments, CommentDetails.class);
    }

    public CommentDetails saveCommentOfPost(Long id, CommentForm fm) {
        Assert.notNull(id, "post id can not be null");

        if (log.isDebugEnabled()) {
            log.debug("find post by id@" + id);
        }

        Post post = postRepository.findOne(id);

        if (post == null) {
            throw new ResourceNotFoundException(id);
        }

        Comment comment = DTOUtils.map(fm, Comment.class);

        comment.setPost(post);

        comment = commentRepository.save(comment);

        if (log.isDebugEnabled()) {
            log.debug("comment saved@" + comment);
        }

        return DTOUtils.map(comment, CommentDetails.class);
    }

    public void deletePostById(Long id) {
        Assert.notNull(id, "post id can not be null");

        if (log.isDebugEnabled()) {
            log.debug("find post by id@" + id);
        }

        Post post = postRepository.findOne(id);

        if (post == null) {
            throw new ResourceNotFoundException(id);
        }

        postRepository.delete(post);
    }

    public void deleteCommentById(Long id) {
        Assert.notNull(id, "comment id can not be null");

        if (log.isDebugEnabled()) {
            log.debug("delete comment by id@" + id);
        }

        Comment comment = commentRepository.findOne(id);

        if (comment == null) {
            throw new ResourceNotFoundException(id);
        }

        commentRepository.delete(comment);
    }
}
