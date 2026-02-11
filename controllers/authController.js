const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToekn = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToekn(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide an email or a password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  createAndSendToekn(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Yor're not logged in ", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const newUser = await User.findById(decoded.id).select("-password");
  if (!newUser) {
    return next(
      new AppError("The user belonging to this token is no longer exist", 401),
    );
  }

  if (newUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password please log in again", 401),
    );
  }
  req.user = newUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permissions to this acction", 403),
      );
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;

  // const message = `forget your password ? please submit a patch request to : ${resetURL}`;
  const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table width="100%" max-width="520px" style="
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">
          <tr>
            <td align="center">
              <h1 style="
                margin: 0;
                font-size: 24px;
                color: #111827;
              ">
                Reset your password
              </h1>

              <p style="
                margin: 16px 0 24px;
                font-size: 15px;
                color: #4b5563;
                line-height: 1.6;
              ">
                You requested to reset your password for your
                <strong>AI-CRS App</strong> account.
                Click the button below to set a new password.
              </p>

              <a href="${resetURL}" style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #4f46e5;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
              ">
                Reset Password
              </a>

              <p style="
                margin: 24px 0 0;
                font-size: 13px;
                color: #6b7280;
              ">
                This link will expire in <strong>10 minutes</strong>.
              </p>

              <hr style="
                margin: 32px 0;
                border: none;
                border-top: 1px solid #e5e7eb;
              " />

              <p style="
                font-size: 13px;
                color: #9ca3af;
                line-height: 1.5;
              ">
                If you didn’t request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>

              <p style="
                margin-top: 24px;
                font-size: 12px;
                color: #9ca3af;
              ">
                © ${new Date().getFullYear()} AI-CRS App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password token valid for (10 min)",
      text: htmlMessage,
    });
    res.status(200).json({
      status: "success",
      message: "Token has been sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("An error occured when sending the email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has experied", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createAndSendToekn(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("This is user isn't exist", 400));
  }
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("You're current password is wrong ", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendToekn(user, 200, res);
});
