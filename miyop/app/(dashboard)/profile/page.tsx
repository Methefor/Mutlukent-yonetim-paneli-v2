import { ProfileForm } from "@/modules/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Profil</h2>
      <ProfileForm />
    </div>
  );
}
