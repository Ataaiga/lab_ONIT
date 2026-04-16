import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Blocks, DollarSign, Wallet, LayoutGrid, Edit3 } from 'lucide-react';

const API_URL =  "/api/projects";

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 
  const [form, setForm] = useState({ 
    name: '', eth_address: '', description: '', target_amount: '', owner_address: '0x71C...890' 
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProjects(data);
    } catch (e) { console.error("Ошибка:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      eth_address: project.eth_address,
      description: project.description || '',
      target_amount: project.target_amount,
      owner_address: project.owner_address
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', eth_address: '', description: '', target_amount: '', owner_address: '0x71C...890' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    cancelEdit();
    fetchProjects();
  };

  const deleteProject = async (id) => {
    if(window.confirm("Удалить проект навсегда?")) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchProjects();
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.blockchainIcon}><Blocks color="#fff" size={20} /></div>
          <div>
            <h1 style={styles.logoText}>CROWDFUND PROTOCOL</h1>
            <span style={styles.versionTag}></span>
          </div>
        </div>
        <div style={styles.walletInfo}>
          <Wallet size={16} color="#0d47a1" />
          <span style={styles.walletText}>0x71C...890</span>
        </div>
      </header>

      <main style={styles.main}>
        <aside>
          <div style={{...styles.card, borderColor: editingId ? '#1565c0' : '#e0e0e0'}}>
            <h2 style={{...styles.cardTitle, color: editingId ? '#1565c0' : '#333'}}>
              {editingId ? <Edit3 size={22} /> : <PlusCircle size={22} />}
              <span style={{marginLeft: '10px'}}>{editingId ? 'Правка описания' : 'Новое размещение'}</span>
            </h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* НАЗВАНИЕ */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Название проекта:</label>
                <input 
                  style={{...styles.input, ...(editingId && styles.disabledInput)}} 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                  disabled={!!editingId}
                />
              </div>

              {/* КОНТРАКТ */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Смарт-контракт (ETH):</label>
                <input 
                  style={{...styles.input, ...(editingId && styles.disabledInput)}} 
                  value={form.eth_address} 
                  onChange={e => setForm({...form, eth_address: e.target.value})}
                  required
                  disabled={!!editingId} 
                />
              </div>

              {/* ЦЕЛЬ СБОРА */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Цель сбора (ETH):</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type="number"
                    step="0.01"
                    style={{...styles.input, paddingLeft: '35px', ...(editingId && styles.disabledInput)}} 
                    value={form.target_amount} 
                    onChange={e => setForm({...form, target_amount: e.target.value})} 
                    required 
                    disabled={!!editingId}
                  />
                  <DollarSign size={16} style={{position: 'absolute', left: '12px', top: '14px', color: editingId ? '#9e9e9e' : '#616161'}} />
                </div>
              </div>

              {/* ОПИСАНИЕ */}
              <div style={styles.inputGroup}>
                <label style={{
                  ...styles.label, 
                  color: editingId ? '#1565c0' : '#333',
                  fontWeight: '900'
                }}>
                  Описание проекта:
                </label>
                <textarea 
                  placeholder="Введите информацию..."
                  style={{
                    ...styles.textarea, 
                    borderColor: editingId ? '#1565c0' : '#e0e0e0',
                    backgroundColor: editingId ? '#e3f2fd' : '#ffffff'
                  }} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                <button type="submit" style={{
                  ...styles.primaryButton, 
                  backgroundColor: editingId ? '#1565c0' : '#0d47a1'
                }}>
                  {editingId ? 'Обновить описание' : 'Создать проект'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} style={styles.secondaryButton}>Отмена</button>
                )}
              </div>
            </form>
          </div>
        </aside>

        <section>
          <div style={styles.sectionHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <LayoutGrid size={24} color="#0d47a1" />
              <h2 style={styles.sectionTitle}>Реестр проектов</h2>
            </div>
            <div style={styles.badge}>{projects.length} записей</div>
          </div>

          <div style={styles.grid}>
            {projects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={styles.projectTitle}>{p.name}</h3>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => startEdit(p)} style={styles.iconBtn} title="Редактировать">
                      <Edit3 size={16} color="#1565c0" />
                    </button>
                    <button onClick={() => deleteProject(p.id)} style={styles.iconBtnDestructive}>
                      <Trash2 size={16} color="#d32f2f" />
                    </button>
                  </div>
                </div>
                <p style={styles.projectDesc}>{p.description || "Описание отсутствует"}</p>
                
                <div style={styles.projectFooter}>
                   <div style={styles.stat}>
                      <span style={styles.statLabel}>Цель:</span>
                      <span style={styles.statValue}>{p.target_amount} ETH</span>
                   </div>
                   <div style={styles.addressBadge}>{p.eth_address.substring(0,10)}...</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#eef4f8', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#212121' }, // Общий цвет текста для светлой темы
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#ffffff', borderBottom: '2px solid #e0e0e0' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '15px' },
  blockchainIcon: { backgroundColor: '#1976d2', padding: '10px', borderRadius: '10px' },
  logoText: { fontSize: '18px', fontWeight: '900', margin: 0, color: '#212121' },
  versionTag: { fontSize: '11px', fontWeight: 'bold', color: '#757575', letterSpacing: '1px' },
  walletInfo: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#e3f2fd', padding: '8px 15px', borderRadius: '8px', border: '2px solid #90caf9' },
  walletText: { color: '#0d47a1', fontWeight: 'bold', fontSize: '13px' },
  main: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px', padding: '30px 40px', maxWidth: '1600px', margin: '0 auto' },
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '15px', border: '2px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  cardTitle: { display: 'flex', alignItems: 'center', fontSize: '20px', fontWeight: '900', marginBottom: '25px', marginTop: 0, color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#616161' },
  input: { padding: '14px', borderRadius: '10px', border: '2px solid #bdbdbd', fontSize: '15px', color: '#212121', backgroundColor: '#ffffff', fontWeight: '600', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
  textarea: { padding: '14px', borderRadius: '10px', border: '2px solid #bdbdbd', fontSize: '15px', color: '#212121', minHeight: '130px', resize: 'none', fontWeight: '500', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease' },
  disabledInput: { backgroundColor: '#f5f5f5', color: '#9e9e9e', border: '2px solid #e0e0e0', cursor: 'not-allowed' },
  primaryButton: { color: '#ffffff', border: 'none', padding: '16px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', transition: 'background-color 0.2s ease' },
  secondaryButton: { backgroundColor: '#ffffff', color: '#424242', border: '2px solid #bdbdbd', padding: '16px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s ease' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  sectionTitle: { fontSize: '24px', fontWeight: '900', color: '#333', margin: 0 },
  badge: { backgroundColor: '#1976d2', color: '#ffffff', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  projectCard: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  projectHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  projectTitle: { fontSize: '18px', fontWeight: '900', color: '#333', margin: 0 },
  projectDesc: { fontSize: '14px', color: '#616161', marginBottom: '20px', lineHeight: '1.6', minHeight: '44px' },
  projectFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '15px', borderTop: '1px solid #eeeeee' },
  stat: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '10px', color: '#9e9e9e', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: '18px', fontWeight: '900', color: '#0d47a1' },
  addressBadge: { fontSize: '12px', backgroundColor: '#e3f2fd', padding: '5px 10px', borderRadius: '6px', color: '#1565c0', fontWeight: 'bold', fontFamily: 'monospace' },
  iconBtn: { background: '#ffffff', border: '2px solid #90caf9', padding: '7px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' },
  iconBtnDestructive: { background: '#ffffff', border: '2px solid #ef9a9a', padding: '7px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' },
};

export default App;