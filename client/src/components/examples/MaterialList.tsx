import MaterialList from "../MaterialList";

export default function MaterialListExample() {
  const mockMaterials = [
    {
      id: "1",
      unNumber: "UN1203",
      materialName: "Gasoline",
      hazardClass: "3",
      packingGroup: "II",
      weight: "5000",
      quantity: 2,
    },
    {
      id: "2",
      unNumber: "UN1993",
      materialName: "Flammable Liquid",
      hazardClass: "3",
      packingGroup: "III",
      weight: "2500",
      quantity: 1,
    },
  ];

  return (
    <MaterialList
      materials={mockMaterials}
      onRemoveMaterial={(id) => {
        console.log("Remove material:", id);
      }}
    />
  );
}
