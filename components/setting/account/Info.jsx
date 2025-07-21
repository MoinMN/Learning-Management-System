import AccountPreference from "./AccountPreference"
import AccountStatus from "./AccountStatus"
import DeleteAccount from "./DeleteAccount"
import SessionControl from "./SessionControl"

const AccountSetting = () => {
  return (
    <div className="w-full space-y-3 md:space-y-6 px-2 py-1 md:px-6 md:py-2">
      {/* Account Preference */}
      <AccountPreference />

      {/* Account Status */}
      <AccountStatus />

      {/* Session & Device Control */}
      <SessionControl />

      {/* Delete or Deactivate Account */}
      <DeleteAccount />
    </div>
  )
}

export default AccountSetting
