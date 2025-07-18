const ManageAttendancePage = async ({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) => {
  const { id, teamId } = await params;
  console.log(id, teamId, "id, teamId");
  return <div>ManageAttendancePage</div>;
};

export default ManageAttendancePage;
