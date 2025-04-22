import React from "react";
import "./ProfessionalPanel.scss";

interface Professional {
    id: number;
    name: string;
    dni: string;
    photoUrl: string;
}

const mockProfessionals: Professional[] = [
    { id: 1, name: "Carlos Ruiz", dni: "23456789", photoUrl: "/images/profile-pic.png" },
    { id: 2, name: "Ana Gómez", dni: "30456789", photoUrl: "/images/profile-pic.png" },
    { id: 3, name: "Lucía Fernández", dni: "31456789", photoUrl: "/images/profile-pic.png" },
    { id: 4, name: "Marcos Díaz", dni: "32456789", photoUrl: "/images/profile-pic.png" },
    { id: 5, name: "Sofía Romero", dni: "33456789", photoUrl: "/images/profile-pic.png" },
    { id: 6, name: "Juan Pérez", dni: "34456789", photoUrl: "/images/profile-pic.png" },
    { id: 7, name: "Elena Torres", dni: "35456789", photoUrl: "/images/profile-pic.png" }
];

const ProfessionalPanel: React.FC = () => {
    return (
        <div className="professional-panel">
            {mockProfessionals.map((pro: any) => (
                <div key={pro.id} className="professional-card">
                    <img src={pro.photoUrl} alt={pro.name} />
                    <div className="info">
                        <p className="name">{pro.name}</p>
                        <p className="dni">DNI: {pro.dni}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfessionalPanel;
