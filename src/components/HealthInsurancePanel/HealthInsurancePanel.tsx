import React, { useEffect, useRef, useState } from 'react';
import './HealthInsurancePanel.scss';
import { HealthInsurance, Plan } from '../../interfaces/HealthInsurance';
import HealthInsuranceService from '../../services/HealthInsuranceService';
import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';
import PlanInsuranceService from '../../services/PlanInsuranceService';
import { toast } from 'react-toastify';
import ConfirmModal from '../shared/ConfirmModal/ConfirmModalComponent';

type ArancelEntry = {
  id: number;
  insuranceId: number;
  serviceId: number;
  amount: number;
};

interface Service {
  id: number;
  name: string;
}

const mockServices: Service[] = [
  { id: 1, name: 'Limpieza de sarro' },
  { id: 2, name: 'Extracción de muela' },
  { id: 3, name: 'Tratamiento de conducto' },
];

const HealthInsurancePanel: React.FC = () => {
  // Planes
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedInsuranceForPlan, setSelectedInsuranceForPlan] = useState<number | ''>('');
  const [planInput, setPlanInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsUpdating] = useState(false);

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedInsuranceForPlan(plan.healthInsuranceId);
    setPlanInput(plan.name);
  };

  const handleDeletePlan = async (id: number) => {
    setIsUpdating(true);

    try {
      // 1) Llamada al backend
      await PlanInsuranceService.deletePlan(id);
      toast.success('Plan eliminado correctamente.');

      // 2) Actualizar estado local — eliminar solo el plan con ese id
      setPlans((prev) => prev.filter((p) => p.id !== id));

      // 3) Cerrar confirm y limpiar selección
      setShowConfirm(false);
      setPlanToDelete(null);
    } catch (error: any) {
      console.error(error);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Error al eliminar el plan';

      if (
        typeof backendError === 'string' &&
        backendError.includes('DataIntegrityViolationException')
      ) {
        toast.error('No se puede eliminar un plan que está asociado a uno o más pacientes.');
      } else {
        toast.error(backendError);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePlan = async () => {
    const trimmedName = planInput.trim();
    const insuranceId = Number(selectedInsuranceForPlan);

    if (!trimmedName || !insuranceId) {
      toast.error('Por favor completa nombre de plan y obra social.');
      return;
    }

    try {
      let savedPlan: Plan;

      if (selectedPlan) {
        // Editar plan existente
        savedPlan = await PlanInsuranceService.updatePlan(
          selectedPlan.healthInsuranceId,
          trimmedName,
          insuranceId
        );
        setPlans((prev) =>
          prev.map((p) =>
            p.healthInsuranceId === selectedPlan.healthInsuranceId
              ? { ...p, name: savedPlan.name, id: savedPlan.healthInsuranceId /* o insuranceId */ }
              : p
          )
        );
        toast.success('Plan actualizado correctamente.');
      } else {
        // Crear nuevo plan
        savedPlan = await PlanInsuranceService.createPlan(trimmedName, insuranceId);
        setPlans((prev) => {
          const newPlan: Plan = {
            id: savedPlan.id,
            name: trimmedName,
            healthInsuranceId: insuranceId,
          };
          return [...prev, newPlan];
        });
        toast.success('Plan creado correctamente.');
      }

      // Limpiar form
      setSelectedPlan(null);
      setPlanInput('');
      setSelectedInsuranceForPlan('');
      await loadInsurancesAndPlans();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Error al guardar el plan.');
    }
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
  const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
  const [insuranceContactEmail, setInsuranceContactEmail] = useState('');
  const [insurancePhone, setInsurancePhone] = useState('');
  const [insuranceNote, setInsuranceNote] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState<HealthInsurance | null>(null);
  const [insuranceInput, setInsuranceInput] = useState('');
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const firstLoadDone = useRef(false);

  const handleEditInsurance = (insurance: HealthInsurance) => {
    setSelectedInsurance(insurance);
    setInsuranceInput(insurance.name);
    setInsuranceContactEmail(insurance.contactEmail);
    setInsuranceNote(insurance.note);
    setInsurancePhone(insurance.phone);
  };

  const handleSaveInsurance = async () => {
    const name = insuranceInput.trim();
    if (!name) return;

    const payload = {
      name,
      contactEmail: insuranceContactEmail,
      phone: insurancePhone,
      note: insuranceNote,
    };

    try {
      if (selectedInsurance) {
        // Edición
        const updated = await HealthInsuranceService.update(selectedInsurance.id, payload);
        setInsurances(insurances.map((ins) => (ins.id === updated.id ? updated : ins)));
        toast.success('Obra social actualizada con éxito');
      } else {
        // Creación
        const created = await HealthInsuranceService.create(payload);
        setInsurances((prev) => [...prev, created]);
        toast.success('Obra social creada con éxito');
      }
    } catch (error: any) {
      console.error('Error en handleSaveInsurance:', error.message);
      toast.error(`❌ ${error.message}`);
    } finally {
      await loadInsurancesAndPlans();
      setSelectedInsurance(null);
      setInsuranceInput('');
      setInsuranceContactEmail('');
      setInsurancePhone('');
      setInsuranceNote('');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await HealthInsuranceService.disable(id);
      } else {
        await HealthInsuranceService.enable(id);
      }

      // Actualizar lista en frontend
      setInsurances((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !isActive } : i)));
    } catch (error: any) {
      console.error('Error al cambiar estado:', error.message);
      alert('❌ Error al cambiar estado de la obra social.');
    }
  };

  // Servicios
  const [services, setServices] = useState<Service[]>(mockServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceInput, setServiceInput] = useState('');

  // const handleNewService = () => {
  //   setSelectedService(null);
  //   setServiceInput('');
  // };

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

  const loadInsurancesAndPlans = async () => {
    if (!firstLoadDone.current) {
      setIsLoading(true);
    }
    try {
      const sorted = await HealthInsuranceService.getAll();
      setInsurances(sorted);

      const flatPlans = sorted.flatMap((ins) =>
        ins.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          healthInsuranceId: ins.id,
        }))
      );
      setPlans(flatPlans);
    } catch (err) {
      console.error('Error al cargar obras sociales:', err);
      toast.error('❌ Error al cargar obras sociales y planes');
    } finally {
      // firstLoadDone.current = true; si lo descomento no aparece el loading cada vez que creo un plan u os
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsurancesAndPlans();
  }, []);

  if (isLoading) return <LoadingSpinner text="Cargando datos..." fullHeight />;

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirmar eliminación"
        message={`¿Seguro que querés eliminar el plan "${planToDelete?.name}"?`}
        onConfirm={async () => {
          if (planToDelete) {
            await handleDeletePlan(planToDelete.healthInsuranceId);
          }
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
      />

      <h3 className="App-secondary-title text-white">Obras Sociales</h3>
      <div className="container">
        {/* ---------------------- OBRAS SOCIALES ---------------------- */}
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
                  {insurances.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center fst-italic">
                        No hay obras sociales para mostrar.
                      </td>
                    </tr>
                  ) : (
                    insurances.map((insurance) => (
                      <tr
                        key={insurance.id}
                        className={!insurance.isActive ? 'inactive-insurance' : ''}
                      >
                        <td>
                          <div>
                            <strong>{insurance.name}</strong>
                            <br />
                            {(insurance.contactEmail || insurance.phone) && (
                              <small>
                                {insurance.contactEmail}
                                {insurance.contactEmail && insurance.phone && ' | '}
                                {insurance.phone}
                              </small>
                            )}
                            <br />
                            <em>{insurance.note}</em>
                            <br />
                            <span
                              className={`badge ${
                                insurance.isActive ? 'bg-success' : 'bg-secondary'
                              }`}
                            >
                              {insurance.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <button
                              className="btn btn-warning btn-lg me-2 btn-health"
                              onClick={() => handleEditInsurance(insurance)}
                            >
                              Editar
                            </button>
                            <button
                              className={`btn btn-lg btn-health btn-activar ${
                                insurance.isActive ? 'btn-danger' : 'btn-success'
                              }`}
                              onClick={() => handleToggleActive(insurance.id, insurance.isActive)}
                            >
                              {insurance.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control form-health"
                    placeholder="Email de contacto"
                    value={insuranceContactEmail}
                    onChange={(e) => setInsuranceContactEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-health"
                    placeholder="Teléfono"
                    value={insurancePhone}
                    onChange={(e) => setInsurancePhone(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control form-health"
                    placeholder="Nota"
                    value={insuranceNote}
                    onChange={(e) => setInsuranceNote(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary btn-health btn-lg"
                  onClick={handleSaveInsurance}
                  disabled={insuranceInput.trim() === ''}
                >
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
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center fst-italic">
                        No hay planes para mostrar.
                      </td>
                    </tr>
                  ) : (
                    plans.map((plan) => {
                      const parent = insurances.find((i) => i.id === plan.healthInsuranceId);
                      return (
                        <tr key={plan.id}>
                          <td>{plan.name}</td>
                          <td>{parent?.name ?? 'N/A'}</td>
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
                    })
                  )}
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
        {/* <div className="row align-items-center mb-4 mt-5">
          <div className="col-md-8 col-12">
            <h3 className="text-white">Servicios</h3>
          </div>
          <div className="col-md-4 col-12 text-md-end mt-2 mt-md-0">
            <button className="btn btn-light btn-health" onClick={handleNewService}>
              Nuevo
            </button>
          </div>
        </div> */}

        {/* <div className="row">
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
        </div> */}

        {/* <div className="row mt-4 mb-5">
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
        </div> */}

        {/* <hr className="my-5 border-light" /> */}

        {/* ---------------------- ARANCELES ---------------------- */}
        {/* <div className="row align-items-center mb-4 mt-5">
          <div className="col-md-8 col-12">
            <h3 className="text-white">Aranceles por obra social y servicio</h3>
          </div>
        </div> */}

        {/* Formulario */}
        {/* <div className="row mb-4">
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
                <button
                  className="btn btn-primary"
                  onClick={handleSaveArancel}
                  disabled={!selectedInsuranceId || !selectedServiceId || amount <= 0}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div> */}

        {/* Tabla de Aranceles */}
        {/* {aranceles.length > 0 && (
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
        )} */}
      </div>
    </>
  );
};

export default HealthInsurancePanel;
