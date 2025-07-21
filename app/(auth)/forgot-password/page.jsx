import ForgotPasswordForm from "../_components/forgotPasswordForm"

const ForgotPassword = () => {
  return (
    <div className="m-auto w-full md:w-3/4">
      <h3 className="text-4xl font_playwrite font-semibold text-center py-6 px-2">
        Forgot Password
      </h3>

      <ForgotPasswordForm />
    </div>
  )
}

export default ForgotPassword
