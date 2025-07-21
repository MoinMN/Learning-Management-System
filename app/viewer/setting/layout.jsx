import SettingNav from "@/components/setting/Nav";

const ViewerSettingLayout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <SettingNav />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

export default ViewerSettingLayout
