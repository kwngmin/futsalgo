const FilterLocation = ({
  onClose,
  filterValues,
  setFilterValues,
}: {
  onClose: () => void;
  filterValues: { location: { city: string; district: string; label: string } };
  setFilterValues: (values: {
    location: { city: string; district: string; label: string };
  }) => void;
}) => {
  return <div onClick={onClose}>FilterLocation</div>;
};

export default FilterLocation;
