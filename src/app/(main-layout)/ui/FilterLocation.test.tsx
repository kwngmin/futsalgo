const FilterLocation = ({
  onClose,
  filterValues,
  setFilterValues,
}: {
  onClose: () => void;
  filterValues: { location: { city: string; district: string; label: string } };
  setFilterValues: (values: {
    location?: { city: string; district: string; label: string };
  }) => void;
}) => {
  console.log(filterValues, "filterValues");

  return (
    <div
      onClick={() => {
        onClose();
        setFilterValues({ location: undefined });
      }}
    >
      FilterLocation
    </div>
  );
};

export default FilterLocation;
