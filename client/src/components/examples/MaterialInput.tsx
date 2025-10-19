import MaterialInput from "../MaterialInput";

export default function MaterialInputExample() {
  return (
    <MaterialInput
      onAddMaterial={(material) => {
        console.log("Material added:", material);
      }}
    />
  );
}
