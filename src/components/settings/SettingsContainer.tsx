
import React from "react";
import AccountSecurity from "@/components/settings/AccountSecurity";
import UserProfile from "@/components/settings/UserProfile";
import DangerZone from "@/components/settings/DangerZone";
import SubscriptionInfo from "@/components/settings/SubscriptionInfo";

const SettingsContainer = () => {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <AccountSecurity />
        <UserProfile />
        <DangerZone />
      </div>
      
      <div>
        <SubscriptionInfo />
      </div>
    </div>
  );
};

export default SettingsContainer;
