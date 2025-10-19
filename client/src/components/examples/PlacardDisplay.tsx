import PlacardDisplay from "../PlacardDisplay";

export default function PlacardDisplayExample() {
  const mockMaterials = [
    {
      id: "1",
      unNumber: "UN1203",
      materialName: "Gasoline",
      hazardClass: "3",
      packingGroup: "II",
      weight: "5000",
      quantity: 1,
    },
    {
      id: "2",
      unNumber: "UN1005",
      materialName: "Ammonia",
      hazardClass: "2.3",
      packingGroup: "N/A",
      weight: "500",
      quantity: 1,
    },
  ];

  return <PlacardDisplay materials={mockMaterials} />;
}
