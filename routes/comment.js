const express = require('express');
const { PaginationParameters } = require('mongoose-paginate-v2');
const jwtVerify = require('../utils/jwt_middleware');
const Comment = require('../models/comment');

const router = express.Router();

router.get('/:stream_id/comments', async function(req, res) {
    const comments = await Comment.paginate({...new PaginationParameters(req).get()});
    res.json(comments.docs);
});

router.post('/:stream_id/comments', jwtVerify, async function(req, res) {
    const { body } = req.body;

    if (!body || body.length < 3) {
        return res.status(400).json({ message: 'comment body should be at least 3 characters' });
    }

    try {
        const comment = new Comment({
            stream_id: req.params.stream_id,
            author_id: req.user.id,
            body
        });

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
