const express = require('express');
const { PaginationParameters } = require('mongoose-paginate-v2');
const jwtVerify = require('../utils/jwt_middleware');
const LPApiClient = require('../utils/livepeer_api_client');
const Stream = require('../models/stream');
const commentRouter = require('./comment');

const router = express.Router();

router.get('/', async function(req, res) {
    const streams = await Stream.paginate({...new PaginationParameters(req).get()}, { select: '-livepeer_stream_key' });
    res.json(streams.docs);
});

router.post('/', jwtVerify, async function(req, res) {
    const { title, description } = req.body;
    let lpStream = null;

    try {
        lpStream = await LPApiClient.post('/stream', {
            name: title,
            record: true,
            profiles: [
                {
                    "name": "720p",
                    "bitrate": 2000000,
                    "fps": 30,
                    "width": 1280,
                    "height": 720
                },
                {
                    "name": "480p",
                    "bitrate": 1000000,
                    "fps": 30,
                    "width": 854,
                    "height": 480
                },
                {
                    "name": "360p",
                    "bitrate": 500000,
                    "fps": 30,
                    "width": 640,
                    "height": 360
                }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

    try {
        const dbStream = new Stream({
            owner_id: req.user.id,
            title,
            description,
            livepeer_id: lpStream.data.id,
            livepeer_stream_key: lpStream.data.streamKey,
            livepeer_playback_id: lpStream.data.playbackId
        });

        await dbStream.save();
        res.json(dbStream);
    } catch (err) {
        if (lpStream) {
            await LPApiClient.delete(`/stream/${lpStream.data.id}`);
        }

        res.status(500).json({ message: err.message });
    }
});

router.get('/:stream_id', async function(req, res) {
    try {
        const dbStream = await Stream.findById(req.params.stream_id).select('-livepeer_stream_key');
        const lpStream = await LPApiClient.get(`/stream/${dbStream.livepeer_id}`);

        const stream = Object.assign(dbStream.toJSON(), {
            isActive: lpStream.data.isActive,
            lastSeen: lpStream.data.lastSeen,
            recorded: lpStream.data.record
        });

        res.json(stream);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.use('/:stream_id/comments', commentRouter);

module.exports = router;
