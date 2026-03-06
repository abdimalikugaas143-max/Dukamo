import type { ContractorAgreement } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ContractPrintViewProps {
  agreement: ContractorAgreement;
}

export function ContractPrintView({ agreement }: ContractPrintViewProps) {
  const details = agreement.details || [];
  const grandTotal = details.reduce((sum, d) => sum + d.total_price, 0);

  return (
    <div className="bg-white text-black font-sans" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000', padding: '20px' }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #1e3a5f', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: '0.5px' }}>
              METAL ENGINEERING OPERATIONS
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
              Heavy Fabrication &amp; Assembly | Trucks &bull; Trailers &bull; Body Tankers
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#555' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f' }}>CONTRACTOR AGREEMENT</div>
            <div style={{ marginTop: '4px' }}>
              <strong>Agreement No:</strong> {agreement.agreement_number}
            </div>
            <div><strong>Date:</strong> {formatDate(agreement.created_at)}</div>
            <div><strong>Status:</strong> <span style={{ textTransform: 'uppercase' }}>{agreement.status}</span></div>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>
            Company (Client)
          </div>
          <div style={{ fontWeight: 'bold' }}>Metal Engineering Operations</div>
          <div style={{ color: '#555', marginTop: '4px', fontSize: '11px' }}>Operations Department</div>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>
            Contractor
          </div>
          <div style={{ fontWeight: 'bold' }}>{agreement.contractor_name}</div>
          {agreement.company_name && <div>{agreement.company_name}</div>}
          {agreement.contractor_phone && <div style={{ color: '#555', fontSize: '11px' }}>Tel: {agreement.contractor_phone}</div>}
          {agreement.contractor_email && <div style={{ color: '#555', fontSize: '11px' }}>Email: {agreement.contractor_email}</div>}
          {agreement.contractor_address && <div style={{ color: '#555', fontSize: '11px' }}>{agreement.contractor_address}</div>}
        </div>
      </div>

      {/* Agreement Title */}
      <div style={{ backgroundColor: '#f0f4f8', padding: '10px 14px', borderLeft: '4px solid #1e3a5f', marginBottom: '16px' }}>
        <strong>Subject:</strong> {agreement.title}
      </div>

      {/* Duration & Value */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Start Date</div>
          <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{formatDate(agreement.start_date)}</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>End Date</div>
          <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{formatDate(agreement.end_date)}</div>
        </div>
        <div style={{ border: '1px solid #1e3a5f', padding: '10px', borderRadius: '4px', textAlign: 'center', backgroundColor: '#e8f0fe' }}>
          <div style={{ fontSize: '10px', color: '#1e3a5f', textTransform: 'uppercase', fontWeight: 'bold' }}>Contract Value</div>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', fontSize: '15px', marginTop: '4px' }}>
            {formatCurrency(agreement.contract_value, agreement.currency)}
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      {agreement.scope_of_work && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', fontSize: '11px', borderBottom: '2px solid #1e3a5f', paddingBottom: '4px', marginBottom: '8px' }}>
            Scope of Work
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>{agreement.scope_of_work}</div>
        </div>
      )}

      {/* Line Items Table */}
      {details.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', fontSize: '11px', borderBottom: '2px solid #1e3a5f', paddingBottom: '4px', marginBottom: '8px' }}>
            Items / Deliverables
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
                <th style={{ padding: '7px 10px', textAlign: 'left', width: '5%' }}>#</th>
                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '7px 10px', textAlign: 'center', width: '10%' }}>Unit</th>
                <th style={{ padding: '7px 10px', textAlign: 'right', width: '10%' }}>Qty</th>
                <th style={{ padding: '7px 10px', textAlign: 'right', width: '14%' }}>Unit Price</th>
                <th style={{ padding: '7px 10px', textAlign: 'right', width: '14%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={d.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '7px 10px' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px' }}>{d.item_description}{d.notes && <div style={{ fontSize: '10px', color: '#888' }}>{d.notes}</div>}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center' }}>{d.unit || '—'}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.quantity}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>{formatCurrency(d.unit_price, agreement.currency)}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(d.total_price, agreement.currency)}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#1e3a5f', color: 'white', fontWeight: 'bold' }}>
                <td colSpan={5} style={{ padding: '8px 10px', textAlign: 'right' }}>GRAND TOTAL</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '13px' }}>{formatCurrency(grandTotal, agreement.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Terms */}
      {agreement.payment_terms && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', fontSize: '11px', borderBottom: '2px solid #1e3a5f', paddingBottom: '4px', marginBottom: '8px' }}>
            Payment Terms
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>{agreement.payment_terms}</div>
        </div>
      )}

      {/* Special Conditions */}
      {agreement.special_conditions && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', fontSize: '11px', borderBottom: '2px solid #1e3a5f', paddingBottom: '4px', marginBottom: '8px' }}>
            Special Conditions
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>{agreement.special_conditions}</div>
        </div>
      )}

      {/* Signatures */}
      <div style={{ borderTop: '2px solid #1e3a5f', paddingTop: '20px', marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', fontSize: '11px', marginBottom: '20px' }}>
          Signatures &amp; Acceptance
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ borderBottom: '1px solid #333', marginBottom: '6px', height: '40px' }}></div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Authorized Company Representative</div>
            <div style={{ color: '#555', fontSize: '10px' }}>Metal Engineering Operations</div>
            <div style={{ marginTop: '10px', color: '#555', fontSize: '10px' }}>Date: ____________________</div>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #333', marginBottom: '6px', height: '40px' }}></div>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Contractor Signature</div>
            <div style={{ color: '#555', fontSize: '10px' }}>{agreement.contractor_name}{agreement.company_name ? ` — ${agreement.company_name}` : ''}</div>
            <div style={{ marginTop: '10px', color: '#555', fontSize: '10px' }}>Date: ____________________</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '8px', textAlign: 'center', fontSize: '10px', color: '#888' }}>
        This agreement was generated by Metal Engineering Operations System &bull; Agreement #{agreement.agreement_number} &bull; {formatDate(agreement.created_at)}
      </div>
    </div>
  );
}
