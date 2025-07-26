import React, { useState } from 'react';
import './HealthInsurancePanel.scss';

interface HealthInsurance {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

const mockInsurances: HealthInsurance[] = [
  { id: 1, name: 'OSDE' },
  { id: 2, name: 'Swiss Medical' },
  { id: 3, name: 'Galeno' },
];

const mockServices: Service[] = [
  { id: 1, name: 'Limpieza de sarro' },
  { id: 2, name: 'Extracción de muela' },
  { id: 3, name: 'Tratamiento de conducto' },
];

type ArancelEntry = {
  id: number;
  insuranceId: number;
  serviceId: number;
  amount: number;
};

interface Plan {
  id: number;
  insuranceId: number; // Relación con la obra social
  name: string;
}

const mockPlans: Plan[] = [
  { id: 1, insuranceId: 1, name: 'OSDE 210' },
  { id: 2, insuranceId: 1, name: 'OSDE 310' },
  { id: 3, insuranceId: 2, name: 'SMG Classic' },
  { id: 4, insuranceId: 2, name: 'SMG Premium' },
  { id: 5, insuranceId: 3, name: 'Galeno Azul' },
  { id: 6, insuranceId: 3, name: 'Galeno Oro' },
];

const HealthInsurancePanel: React.FC = () => {
  // Planes
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedInsuranceForPlan, setSelectedInsuranceForPlan] = useState<number | ''>('');
  const [planInput, setPlanInput] = useState('');

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedInsuranceForPlan(plan.insuranceId);
    setPlanInput(plan.name);
  };

  const handleDeletePlan = (id: number) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  const handleSavePlan = () => {
    const trimmed = planInput.trim();
    if (!trimmed || selectedInsuranceForPlan === '') return;

    if (selectedPlan) {
      setPlans(
        plans.map((p) =>
          p.id === selectedPlan.id
            ? { ...p, name: trimmed, insuranceId: Number(selectedInsuranceForPlan) }
            : p
        )
      );
    } else {
      setPlans([
        ...plans,
        {
          id: Date.now(),
          name: trimmed,
          insuranceId: Number(selectedInsuranceForPlan),
        },
      ]);
    }

    setSelectedPlan(null);
    setPlanInput('');
    setSelectedInsuranceForPlan('');
  };

  // Aranceles
  const [aranceles, setAranceles] = useState<ArancelEntry[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | ''>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [amountInput, setAmountInput] = useState<string>('');

  const handleSaveArancel = () => {
    if (
      selectedInsuranceId === '' ||
      selectedServiceId === '' ||
      amountInput.trim() === '' ||
      isNaN(Number(amountInput))
    ) {
      alert('Completa todos los campos correctamente');
      return;
    }

    setAranceles([
      ...aranceles,
      {
        id: Date.now(),
        insuranceId: Number(selectedInsuranceId),
        serviceId: Number(selectedServiceId),
        amount: Number(amountInput),
      },
    ]);

    // Reset
    setSelectedInsuranceId('');
    setSelectedServiceId('');
    setAmountInput('');
  };

  // Obras Sociales
  const [insurances, setInsurances] = useState<HealthInsurance[]>(mockInsurances);
  const [selectedInsurance, setSelectedInsurance] = useState<HealthInsurance | null>(null);
  const [insuranceInput, setInsuranceInput] = useState('');

  const handleNewInsurance = () => {
    setSelectedInsurance(null);
    setInsuranceInput('');
  };

  const handleEditInsurance = (insurance: HealthInsurance) => {
    setSelectedInsurance(insurance);
    setInsuranceInput(insurance.name);
  };

  const handleDeleteInsurance = (id: number) => {
    setInsurances(insurances.filter((i) => i.id !== id));
  };

  const handleSaveInsurance = () => {
    const trimmed = insuranceInput.trim();
    if (trimmed === '') return;

    if (selectedInsurance) {
      setInsurances(
        insurances.map((i) => (i.id === selectedInsurance.id ? { ...i, name: trimmed } : i))
      );
    } else {
      setInsurances([...insurances, { id: Date.now(), name: trimmed }]);
    }

    setSelectedInsurance(null);
    setInsuranceInput('');
  };

  // Servicios
  const [services, setServices] = useState<Service[]>(mockServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceInput, setServiceInput] = useState('');

  const handleNewService = () => {
    setSelectedService(null);
    setServiceInput('');
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setServiceInput(service.name);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleSaveService = () => {
    const trimmed = serviceInput.trim();
    if (trimmed === '') return;

    if (selectedService) {
      setServices(services.map((s) => (s.id === selectedService.id ? { ...s, name: trimmed } : s)));
    } else {
      setServices([...services, { id: Date.now(), name: trimmed }]);
    }

    setSelectedService(null);
    setServiceInput('');
  };

  return (
    <div className="container mt-5">
      {/* ---------------------- OBRAS SOCIALES ---------------------- */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8 col-12">
          <h3 className="text-white">Obras Sociales</h3>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped bg-white">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th style={{ width: '200px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insurances.map((insurance) => (
                  <tr key={insurance.id}>
                    <td>{insurance.name}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-warning btn-lg me-2 btn-health"
                          onClick={() => handleEditInsurance(insurance)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-lg btn-health"
                          onClick={() => handleDeleteInsurance(insurance.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-6 col-md-8 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                {selectedInsurance ? 'Editar obra social' : 'Agregar obra social'}
              </h5>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-health"
                  placeholder="Nombre de la obra social"
                  value={insuranceInput}
                  onChange={(e) => setInsuranceInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-health btn-lg" onClick={handleSaveInsurance}>
                {selectedInsurance ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5 border-light" />

      {/* ---------------------- Planes ---------------------- */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8 col-12">
          <h3 className="text-white">Planes por Obra Social</h3>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped bg-white">
              <thead className="table-dark">
                <tr>
                  <th>Plan</th>
                  <th>Obra Social</th>
                  <th style={{ width: '200px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const insuranceName =
                    insurances.find((i) => i.id === plan.insuranceId)?.name || 'N/A';
                  return (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td>{insuranceName}</td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-warning btn-lg me-2 btn-health"
                            onClick={() => handleEditPlan(plan)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-lg btn-health"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4 mb-5">
        <div className="col-lg-6 col-md-8 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{selectedPlan ? 'Editar plan' : 'Agregar plan'}</h5>
              <div className="mb-3">
                <select
                  className="form-select form-health"
                  value={selectedInsuranceForPlan}
                  onChange={(e) => setSelectedInsuranceForPlan(Number(e.target.value))}
                >
                  <option value="">Seleccionar obra social</option>
                  {insurances.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-health"
                  placeholder="Nombre del plan"
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-health btn-lg" onClick={handleSavePlan}>
                {selectedPlan ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5 border-light" />

      {/* ---------------------- SERVICIOS ---------------------- */}
      <div className="row align-items-center mb-4 mt-5">
        <div className="col-md-8 col-12">
          <h3 className="text-white">Servicios</h3>
        </div>
        {/* <div className="col-md-4 col-12 text-md-end mt-2 mt-md-0">
          <button className="btn btn-light btn-health" onClick={handleNewService}>
            Nuevo
          </button>
        </div> */}
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped bg-white">
              <thead className="table-dark">
                <tr>
                  <th>Nombre del Servicio</th>
                  <th style={{ width: '200px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.name}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-warning btn-lg me-2 btn-health"
                          onClick={() => handleEditService(service)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-lg btn-health"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4 mb-5">
        <div className="col-lg-6 col-md-8 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                {selectedService ? 'Editar servicio' : 'Agregar servicio'}
              </h5>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-health"
                  placeholder="Nombre del servicio"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-health btn-lg" onClick={handleSaveService}>
                {selectedService ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5 border-light" />

      {/* ---------------------- ARANCELES ---------------------- */}
      <div className="row align-items-center mb-4 mt-5">
        <div className="col-md-8 col-12">
          <h3 className="text-white">Aranceles por obra social y servicio</h3>
        </div>
      </div>

      {/* Formulario */}
      <div className="row mb-4">
        <div className="col-lg-6 col-md-8 col-sm-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Agregar arancel</h5>
              <div className="mb-3">
                <select
                  className="form-select form-health"
                  value={selectedInsuranceId}
                  onChange={(e) => setSelectedInsuranceId(Number(e.target.value))}
                >
                  <option value="">Seleccionar obra social</option>
                  {insurances.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <select
                  className="form-select form-health"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control form-health"
                  placeholder="Monto / Arancel"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-health btn-lg" onClick={handleSaveArancel}>
                Guardar
              </button>
              {/* <button
                className="btn btn-primary"
                onClick={handleSaveArancel}
                disabled={!selectedInsuranceId || !selectedServiceId || amount <= 0}
              >
                Guardar
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Aranceles */}
      {aranceles.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped bg-white">
                <thead className="table-dark">
                  <tr>
                    <th>Obra Social</th>
                    <th>Servicio</th>
                    <th>Arancel ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {aranceles.map((a) => {
                    const insuranceName =
                      insurances.find((i) => i.id === a.insuranceId)?.name || 'N/A';
                    const serviceName = services.find((s) => s.id === a.serviceId)?.name || 'N/A';

                    return (
                      <tr key={a.id}>
                        <td>{insuranceName}</td>
                        <td>{serviceName}</td>
                        <td>${a.amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInsurancePanel;
