import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "app.title": "Hazmat Placard",
    "tabs.materials": "Materials",
    "tabs.placards": "Placards",
    "tabs.reference": "Reference",
    "materials.add.title": "Add Hazmat Material",
    "materials.add.description": "Enter the details of each hazardous material you're transporting",
    "materials.current.title": "Current Load",
    "materials.current.description": "Review and manage your hazmat materials",
    "input.unNumber": "UN Number",
    "input.unNumber.placeholder": "e.g., UN1203",
    "input.materialName": "Material Name",
    "input.materialName.placeholder": "e.g., Gasoline",
    "input.hazardClass": "Hazard Class",
    "input.hazardClass.placeholder": "Select hazard class",
    "input.packingGroup": "Packing Group",
    "input.packingGroup.placeholder": "Select packing group",
    "input.containerSize": "Container Size",
    "input.containerSize.placeholder": "Select container size",
    "input.stopNumber": "Stop Number (Loading Facility)",
    "input.weight": "Total Weight (lbs)",
    "input.weight.description": "Combined weight of all containers for this material.",
    "input.quantity": "Quantity (containers)",
    "input.quantity.description": "Number of containers (for your reference).",
    "button.addMaterial": "Add Material",
    "button.saveMaterial": "Save Changes",
    "button.cancel": "Cancel",
    "button.clearAll": "Clear All Materials",
    "button.confirmClear": "Yes, Clear All",
    "list.empty": "No materials added yet. Add your first hazmat material above.",
    "list.totalMaterials": "Total Materials",
    "list.totalWeight": "Total Weight",
    "confirm.clearTitle": "Clear all materials?",
    "confirm.clearDescription": "This will remove all materials from your current load. This action cannot be undone.",
    "quick.title": "Quick Check - Your Load",
    "quick.materials": "Materials",
    "quick.weight": "Total Weight",
    "quick.containers": "Containers",
    "quick.stops": "Stops",
    "quick.hazardClasses": "Hazard Class",
    "quick.hazardClassesPlural": "Hazard Classes",
    "quick.bulk": "Bulk Containers",
    "quick.pih": "PIH Material",
    "placards.title": "Placard Requirements",
    "placards.description": "Based on CFR 49 regulations and your current load",
    "warning.highWeight": "Unusually high weight. Please verify this is correct.",
    "pih.title": "Poison Inhalation Hazard (PIH)",
    "pih.description": "Check this if this material requires the PIH subsidiary placard",
    "container.nonBulk": "95 Gallons or Below",
    "container.bulk": "Above 95 Gallons",
    "pg.1": "Packing Group I - High Danger",
    "pg.2": "Packing Group II - Medium Danger",
    "pg.3": "Packing Group III - Low Danger",
    "pg.na": "N/A - Not Applicable",
  },
  es: {
    "app.title": "Letrero Hazmat",
    "tabs.materials": "Materiales",
    "tabs.placards": "Letreros",
    "tabs.reference": "Referencia",
    "materials.add.title": "Agregar Material Peligroso",
    "materials.add.description": "Ingrese los detalles de cada material peligroso que transporta",
    "materials.current.title": "Carga Actual",
    "materials.current.description": "Revise y administre sus materiales peligrosos",
    "input.unNumber": "Numero UN",
    "input.unNumber.placeholder": "ej., UN1203",
    "input.materialName": "Nombre del Material",
    "input.materialName.placeholder": "ej., Gasolina",
    "input.hazardClass": "Clase de Peligro",
    "input.hazardClass.placeholder": "Seleccione clase de peligro",
    "input.packingGroup": "Grupo de Embalaje",
    "input.packingGroup.placeholder": "Seleccione grupo de embalaje",
    "input.containerSize": "Tamano del Contenedor",
    "input.containerSize.placeholder": "Seleccione tamano del contenedor",
    "input.stopNumber": "Numero de Parada (Instalacion de Carga)",
    "input.weight": "Peso Total (lbs)",
    "input.weight.description": "Peso combinado de todos los contenedores para este material.",
    "input.quantity": "Cantidad (contenedores)",
    "input.quantity.description": "Numero de contenedores (para su referencia).",
    "button.addMaterial": "Agregar Material",
    "button.saveMaterial": "Guardar Cambios",
    "button.cancel": "Cancelar",
    "button.clearAll": "Borrar Todos los Materiales",
    "button.confirmClear": "Si, Borrar Todo",
    "list.empty": "No hay materiales agregados. Agregue su primer material peligroso arriba.",
    "list.totalMaterials": "Total de Materiales",
    "list.totalWeight": "Peso Total",
    "confirm.clearTitle": "Borrar todos los materiales?",
    "confirm.clearDescription": "Esto eliminara todos los materiales de su carga actual. Esta accion no se puede deshacer.",
    "quick.title": "Verificacion Rapida - Su Carga",
    "quick.materials": "Materiales",
    "quick.weight": "Peso Total",
    "quick.containers": "Contenedores",
    "quick.stops": "Paradas",
    "quick.hazardClasses": "Clase de Peligro",
    "quick.hazardClassesPlural": "Clases de Peligro",
    "quick.bulk": "Contenedores a Granel",
    "quick.pih": "Material PIH",
    "placards.title": "Requisitos de Letreros",
    "placards.description": "Basado en las regulaciones CFR 49 y su carga actual",
    "warning.highWeight": "Peso inusualmente alto. Por favor verifique que sea correcto.",
    "pih.title": "Peligro de Inhalacion de Veneno (PIH)",
    "pih.description": "Marque esto si este material requiere el letrero subsidiario PIH",
    "container.nonBulk": "95 Galones o Menos",
    "container.bulk": "Mas de 95 Galones",
    "pg.1": "Grupo de Embalaje I - Alto Peligro",
    "pg.2": "Grupo de Embalaje II - Peligro Medio",
    "pg.3": "Grupo de Embalaje III - Bajo Peligro",
    "pg.na": "N/A - No Aplica",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
