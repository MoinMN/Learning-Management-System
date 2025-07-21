import ResetPasswordForm from "../_components/resetPassword";

const ForgotPassword = () => {
  return (
    <div className="m-auto w-full md:w-3/4">
      <h3 className="text-4xl font_playwrite font-semibold text-center py-6">
        Reset Password
      </h3>

      <ResetPasswordForm />
    </div>
  )
}

export default ForgotPassword
