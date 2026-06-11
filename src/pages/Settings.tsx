import Layout from "@/components/Layout";
import { Settings as SettingsIcon, Bell, Eye, Shield, Globe } from "lucide-react";

const Settings = () => {
  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-accent" />
          <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Eye className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Reading Progress</h3>
                  <p className="text-sm text-muted-foreground">Show reading progress on books</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Privacy</h3>
                  <p className="text-sm text-muted-foreground">Manage your privacy settings</p>
                </div>
              </div>
              <span className="text-accent">→</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Language</h3>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
              </div>
              <span className="text-accent">→</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};




export default Settings;
