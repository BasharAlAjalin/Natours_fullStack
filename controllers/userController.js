const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const fillterObj = (obj, ...allowFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) {
      newObject[el] = obj[el];
    }
  });
  return newObject;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: "success",
    results: user.length,
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route isn't for password updates. Please use /updatepassword",
        400,
      ),
    );
  }

  const filterBody = fillterObj(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const deleteToken = user.createDeleteToken();
  await user.save({ validateBeforeSave: false });

  const deleteURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/confirmDelete/${deleteToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Confirm Account Deletion – AI-CRS",
      text: `Please confirm your account deletion: ${deleteURL}`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      
      <h2 style="color: #e63946; text-align: center;">Account Deletion Request</h2>
      
      <p style="font-size: 16px; color: #333;">
        Hello ${user.name},
      </p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        We received a request to delete your account. 
        If you made this request, please confirm by clicking the button below.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${deleteURL}" 
           style="
             background-color: #e63946;
             color: #ffffff;
             padding: 12px 25px;
             text-decoration: none;
             font-size: 16px;
             border-radius: 5px;
             display: inline-block;
           ">
           Confirm Account Deletion
        </a>
      </div>

      <p style="font-size: 14px; color: #777; line-height: 1.6;">
        If you did not request this, you can safely ignore this email. 
        Your account will remain active.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #999; text-align: center;">
        This link will expire in 10 minutes for security reasons.
      </p>

    </div>
  </div>
  `,
    });
  } catch (err) {
    console.log(err);
    user.deleteToken = undefined;
    user.deleteTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500,
      ),
    );
  }

  // Return token for testing in Postman
  res.status(200).json({
    status: "success",
    message: "Confirmation email sent",
    deleteToken, // <--- token exposed for testing
  });
});

exports.confirmDelete = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    deleteToken: hashedToken,
    deleteTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  user.active = false;
  user.deleteToken = undefined;
  user.deleteTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Account has been deactivated successfully",
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
