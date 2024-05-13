var express = require('express');
var router = express.Router();
var modelUser = require('../models/user');
// GET all users.
router.get('/', async function (req, res, next) {
    try {
        var data = await modelUser.find();
        res.json({ data: data });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi lấy dữ liệu người dùng" });
    }
});

// GET user by id.
router.get('/:id', async function (req, res, next) {
    try {
        const userId = req.params.id;
        const user = await modelUser.findById(userId);
        if (!user) {
            res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
            return;
        }
        res.status(200).json({ status: true, user: user });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi tìm kiếm người dùng" });
    }
})

// POST register user.
router.post('/register', async function (req, res, next) {
    try {
        const { email, password, coin, localPass } = req.body;
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await modelUser.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email đã tồn tại trong hệ thống" });
        }
        // Nếu email không tồn tại, tiếp tục quá trình đăng ký
        const userInsert = new modelUser({
            email: email,
            password: password,
            coin: coin ? coin : 0 ,
            localPass: localPass ? localPass : null
        });
        await userInsert.save();
        res.json({ status: true, message: 'Thêm người dùng thành công' });
    } catch (error) {
        res.status(500).json({ status: false, message: "Thêm người dùng thất bại" });
    }
});
// POST login user.
router.post('/login', async function (req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await modelUser.findOne({ email, password });
        if (!user) {
            res.status(401).json({ status: false, message: "Đăng nhập thất bại" });
            return;
        }
        res.status(200).json({ status: true, message: "Đăng nhập thành công", data: user });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi đăng nhập" });
    }
});
// PUT update localPass.
router.put('/update-localPass/:id', async function (req, res, next) {
    try {
        const userId = req.params.id;
        const { localPass } = req.body;

        // Kiểm tra xem người dùng tồn tại trong cơ sở dữ liệu hay không
        const user = await modelUser.findById(userId);
        if (!user) {
            res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
            return;
        }

        // Cập nhật localPass của người dùng
        user.localPass = localPass ? localPass : null;
        await user.save();

        res.status(200).json({ status: true, message: "Cập nhật localPass thành công", user: user });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi cập nhật localPass" });
    }
});
// PUT update premium.
router.put('/update-premium/:id', async function (req, res, next) {
    try {
        const userId = req.params.id;
        let { premium } = req.body;

        // Chuyển đổi premium thành số nguyên nếu nó là một chuỗi có thể được chuyển đổi thành số
        if (typeof premium === 'string') {
            premium = parseInt(premium);
        }

        // Kiểm tra xem giá trị premium hợp lệ (0, 1 hoặc 2)
        if (![0, 1, 2].includes(premium)) {
            res.status(400).json({ status: false, message: "Giá trị premium không hợp lệ. Chỉ chấp nhận 0, 1 hoặc 2." });
            return;
        }

        // Kiểm tra xem người dùng tồn tại trong cơ sở dữ liệu hay không
        const user = await modelUser.findById(userId);
        if (!user) {
            res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
            return;
        }

        // Cập nhật premium của người dùng
        user.premium = premium;
        await user.save();

        res.status(200).json({ status: true, message: "Cập nhật premium thành công", user: user });
    } catch (error) {
        res.status(500).json({ status: false, message: "Lỗi khi cập nhật premium" });
    }
});


module.exports = router;
