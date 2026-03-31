import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../lib/utils';

interface ContractTemplateProps {
  clientData: any;
  sellPrice: number;
}

export function ContractTemplate({ clientData, sellPrice }: ContractTemplateProps) {
  const { rooms } = useBudgetStore();
  const today = new Date().toLocaleDateString('en-US');
  
  const totalWithTax = sellPrice * 1.065; // Taxa de 6.5% da Flórida conforme PDF

  return (
    <div className="hidden print:block bg-white text-black p-12 font-serif text-[12pt] leading-relaxed max-w-[210mm] mx-auto">
      
      {/* Página 1 */}
      <div className="min-h-[297mm] mb-20">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="NOHA" className="h-16 mx-auto mb-6 grayscale" />
          <h1 className="text-lg font-bold uppercase tracking-tight max-w-2xl mx-auto">
            SERVICE AGREEMENT FOR THE PREPARATION OF PERSONALIZED FURNITURE PROJECT WITH INSTALLATION AND DECORATION
          </h1>
        </div>

        <p className="mb-8">The parties, on the date of signature, celebrate with each other:</p>

        <section className="mb-10">
          <h2 className="font-bold underline uppercase mb-4">CUSTOMER SERVICE CONTRACTOR (CONTRACTING PARTY):</h2>
          <div className="space-y-1">
            <p><span className="font-bold">Name:</span> {clientData?.clientName || '________________________________'}</p>
            <p><span className="font-bold">Passport Number:</span> {clientData?.passportNumber || '________________'}</p>
            <p><span className="font-bold">Address:</span> {clientData?.clientAddress || '________________________________'}</p>
            <p><span className="font-bold">Vacation Home Address:</span> {clientData?.vacationHomeAddress || '________________________________'}</p>
            <p><span className="font-bold">Email:</span> {clientData?.clientEmail || '________________'}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-bold underline uppercase mb-4">SERVICE PROVIDER CONTRACTOR (CONTRACTOR):</h2>
          <div className="space-y-1">
            <p className="font-bold">NOHA CONCEPT LLC</p>
            <p>6314 Kingspointe Pkwy, Suite 05, Orlando, FL 32819</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-bold underline uppercase mb-4">GENERAL TERMS AND CONDITIONS OF AGREEMENT</h2>
          <p className="text-justify text-xs mb-4">
            By agreeing to these General Terms and Conditions, the CUSTOMER SERVICE CONTRACTOR declares that you are at the least the age of majority in your state or province of residence, being fully capable and in the enjoyment of your rights...
          </p>
          <p className="text-justify text-xs">
            A violation of any of the terms and conditions may result in an immediate termination of your services and the application of legal penalties provided for in this Contract.
          </p>
        </section>

        <section>
          <h2 className="font-bold underline uppercase mb-4">OBJECT</h2>
          <p className="mb-4 text-sm">
            SERVICE PROVIDER CONTRACTOR will prepare a personalized furniture project and customized decoration of the residence owned by the contracting party, in the following environments:
          </p>
          <ul className="list-disc ml-8 text-sm uppercase">
            {rooms.map((room, idx) => (
              <li key={idx} className="font-bold">{room.type}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Página 2: Financeiro */}
      <div className="min-h-[297mm] mb-20 pt-10 border-t border-slate-200">
        <h2 className="font-bold underline uppercase mb-6">PRICE, PAYMENT, DURATION OF SERVICE, AND OTHER CONDITIONS</h2>
        <p className="mb-6 text-justify text-sm">
          The CONTRACTING PARTY and CONTRACTOR agree that the total budget limit for this Contract, covering all stages of the project, is 
          <span className="font-bold"> {formatCurrency(totalWithTax)} </span> 
          (Total includes 6.5% Florida Sales Tax).
        </p>

        <p className="mb-6 font-bold text-sm">Both parties agreed that the payment will be divided into four installments:</p>
        
        <div className="space-y-4 mb-10 ml-6 text-sm">
          {clientData?.installments?.map((inst: any, idx: number) => (
            <p key={idx} className="flex gap-4">
              <span className="font-bold min-w-[30%]">• {inst.label}:</span>
              <span>{formatCurrency(inst.value)}</span>
              <span className="text-slate-500 italic"> - Expected Date: {inst.date || 'To be defined'}</span>
            </p>
          ))}
        </div>

        <section className="mb-10">
           <h2 className="font-bold underline uppercase mb-4 text-sm">Scope of Work and Service Delivery</h2>
           <p className="text-justify text-xs leading-relaxed">
             The CONTRACTOR will provide custom furniture design and home decoration services as described in the scope of the work. The first stage of the service, which involves the design of furniture and home decoration, is already finalized...
           </p>
        </section>

        <section className="mb-10 pt-10">
           <div className="bg-slate-100 p-8 text-center rounded-lg border border-slate-200">
              <h3 className="font-bold text-sm uppercase mb-4">Payment Information</h3>
              <p className="text-xs">WIRE TRANSFER - CHECK - ZELLE</p>
              <div className="mt-4 text-[10px] space-y-1">
                 <p>Name of the business: NOHA CONCEPT LLC</p>
                 <p>Address: 6314 Kingspointe Pkwy Ste #5 Orlando FL 32819</p>
                 <p>Bank: Bank of America</p>
                 <p>Checking Account: 898157369534</p>
                 <p>Email: finance@nohaconcept.com</p>
              </div>
           </div>
        </section>

        {/* Assinaturas */}
        <div className="mt-20 pt-10 grid grid-cols-2 gap-20">
           <div className="text-center">
              <div className="border-b border-black mb-2"></div>
              <p className="text-[10px] uppercase font-bold">CONTRACTING PARTY</p>
              <p className="text-[10px] uppercase text-slate-500">{clientData?.clientName}</p>
              <p className="text-[10px]">Date: {today}</p>
           </div>
           <div className="text-center">
              <div className="border-b border-black mb-2"></div>
              <p className="text-[10px] uppercase font-bold">CONTRACTOR</p>
              <p className="text-[10px] uppercase text-slate-500">NOHA CONCEPT LLC</p>
              <p className="text-[10px]">Date: {today}</p>
           </div>
        </div>
      </div>

    </div>
  );
}
