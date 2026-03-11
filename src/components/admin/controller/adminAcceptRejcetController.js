const withDrawRequest = require("../../user/models/withDrawRequest");
const withdrawalRequest = require("../../user/models/withDrawRequest");
const { appString } = require("../../utils/appString");
const { success } = require("../../utils/commonUtils");
const WithdrawRequest = require("../../user/models/withDrawRequest");
const User = require("../../user/models/user")
const Wallet = require("../../user/models/wallet")
const Admin = require("../model/admin")
const withDrawAcceptRejcectController = {
    getWithDrawRequest: async (req, res) => {
        try {
            const requests = await withDrawRequest.find()
                .populate("userId", "name email")

            res.json({ success: true, data: requests })

        } catch (error) {

            console.log(error);

            res.status(500).json({ success: false, message: appString.SERVERERROR })

        }
    },
    updateWithdrawStatus: async (req, res) => {

        try {

            const { requestId } = req.params;
            const { status } = req.body; // 1 = Accept , 2 = Reject

            const request = await WithdrawRequest.findById(requestId);

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: appString.REQUESTNOTFOUND
                });
            }

            if (request.status !== 0) {
                return res.status(400).json({
                    success: false,
                    message: appString.REQUESTALREDYPROCEED
                });
            }

            // Reject Request
            if (status === 2) {

                request.status = 2;

                await request.save();

                return res.json({
                    success: true,
                    message: appString.WITHDRAWREQUESTREJECTED
                });
            }

            // Accept Request
            if (status === 1) {

                const points = Number(request.points);

                if (!points || points <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: appString.INSUFFICIANTPOINTS
                    });
                }

                const amount = (points / 100) * 10;

                const adminFee = amount * 0.10;

                const userAmount = amount - adminFee;

                let wallet = await Wallet.findOne({ userId: request.userId });

                if (!wallet) {
                    wallet = await Wallet.create({
                        userId: request.userId,
                        balance: 0
                    });
                }

                wallet.balance = Number(wallet.balance || 0) + Number(userAmount);

                await wallet.save();

                const admin = await Admin.findOne();

                if (admin) {

                    admin.adminFeeConfigure =
                        Number(admin.adminFeeConfigure || 0) + Number(adminFee);

                    await admin.save();
                }

                request.status = 1;

                await request.save();

                return res.json({
                    success: true,
                    message: appString.WITHDRAWAPPROVED,
                    points,
                    amount,
                    adminFee,
                    userAmount
                });
            }

            return res.status(400).json({
                success: false,
                message: appString.INVALIDSTATUSVALUE
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                message: appString.SERVERERROR
            });
        }

    }
};

module.exports = withDrawAcceptRejcectController;