// Vercel serverless function: POST /api/ask
// Calls the Google Gemini API (free tier, no credit card required) to answer
// legal questions, grounded in our knowledge base.
// Requires GEMINI_API_KEY to be set as an environment variable on Vercel.
// Get a free key at https://aistudio.google.com/apikey

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// The same knowledge base used in the frontend fallback — kept here so the
// model answers ONLY from vetted content instead of making things up.
const KNOWLEDGE_BASE = `
1. Security deposit not returned: A landlord must return the deposit after move-out, minus documented damage/dues. Send a written request with a deadline. If ignored, approach the Rent Authority (Model Tenancy Act states) or Consumer/Rent Court. Keep the agreement, photos, and messages as evidence.

2. Eviction without notice: Landlords must give proper written notice (15-30 days per lease/state rules) and, if needed, a court order. Illegal methods (cutting power/water, forced removal) are not valid. Respond in writing and consult a legal aid clinic before leaving.

3. Unfair rent increase: Increases should follow the signed agreement's terms. Get any proposed increase in writing. Contest increases outside agreed terms with the Rent Authority or Rent Court.

4. Defective product / refused refund: Under the Consumer Protection Act 2019, buyers can get a refund/replacement/repair, especially within warranty. Send a written complaint to the seller first. Escalate via National Consumer Helpline (1915) or e-Daakhil portal (edaakhil.nic.in) — no lawyer required.

5. Online fraud: Save chat logs, receipts, screenshots. File a consumer complaint (1915 / e-Daakhil) and, if money was stolen, a separate cybercrime complaint at cybercrime.gov.in or call 1930.

6. Salary not paid: Governed by the Payment of Wages Act / Code on Wages. Keep appointment letter, payslips, and written communication. File with the state Labour Commissioner's office, often via the Shram Suvidha portal.

7. Workplace harassment: Under the POSH Act 2013, workplaces with 10+ employees must have an Internal Complaints Committee (ICC). File a written complaint within 3 months (extendable). If no ICC, approach the district's Local Complaints Committee.

8. Wrongful termination: Notice and severance terms come from the appointment letter and, for eligible categories, the Industrial Disputes Act. Raise unresolved issues with the Labour Commissioner's office.

9. Right to Information (RTI): Any citizen can request information from a public authority under the RTI Act 2005. Pay a small fee (~₹10), submit to the Public Information Officer via rtionline.gov.in or the state RTI portal. Response due within 30 days.

10. Filing a consumer complaint: Under the Consumer Protection Act 2019, file via e-Daakhil (edaakhil.nic.in) or call 1915. No lawyer required. Forum depends on claim amount: District, State, or National Commission.

11. Free legal aid: Under the Legal Services Authorities Act 1987, eligible groups (women, SC/ST, low-income, etc.) get free lawyers via NALSA (helpline 15100) or the nearest District Legal Services Authority.

12. Domestic violence: Under the Protection of Women from Domestic Violence Act 2005, victims can seek a Protection Order, Residence Order, or Monetary Relief without needing to have already left home. Call the Women Helpline (181) for 24/7 support, or approach a Protection Officer, police, or Magistrate's Court directly.

13. Police harassment or misconduct: Police must follow proper legal procedure when questioning, detaining, or arresting someone. A person has the right to know the grounds of arrest, to inform a family member/friend, and to consult a lawyer. Note the date, time, place, and the officer's name/badge number. File a written complaint with the district's Superintendent of Police (SP) or the State Police's online grievance portal. For serious issues like custodial violence or wrongful detention, approach the State or National Human Rights Commission (nhrc.nic.in) or a Magistrate directly. Relevant law: Bharatiya Nagarik Suraksha Sanhita, 2023 (which replaced the CrPC) and the Protection of Human Rights Act, 1993.

14. Illegal lockout by landlord: A landlord cannot forcibly evict a tenant by changing locks, removing belongings, or cutting utilities, regardless of any pending rent dispute. File a police complaint immediately, and approach the Rent Court or Magistrate for an urgent restoration order.

15. Property inheritance disputes: Inheritance rights depend on the applicable personal law (Hindu, Muslim, Christian, etc.) and whether the deceased left a valid will. Without a will, succession follows personal law's intestate rules under the Hindu Succession Act, 1956 or Indian Succession Act, 1925. A legal heir/succession certificate may be needed from a civil court. If a family member denies a rightful share, send a legal notice before filing a partition suit.

16. Land encroachment: Get land measured and boundaries verified via the local revenue/survey office. Send a legal notice to the encroacher demanding removal. If unresolved, file a suit for injunction and possession in civil court, using sale deed and mutation records as evidence.

17. Cyberbullying/online harassment: Take screenshots with timestamps before blocking. Report the content/account to the platform. File a complaint at cybercrime.gov.in or call the Cyber Crime Helpline (1930). For serious threats, also file a police complaint. Relevant law: Information Technology Act, 2000.

18. Revenge porn / non-consensual image sharing: Do not engage with the blackmailer or pay money. Report immediately at cybercrime.gov.in (dedicated section for this) or call 1930. Ask the platform to remove the content, and file a police complaint — treated as a serious offence under IT Act Section 66E and the Bharatiya Nyaya Sanhita, 2023.

19. OTP/UPI fraud: Call the bank's fraud helpline immediately to block transactions. Report within hours at cybercrime.gov.in or call 1930 — early reporting can freeze the fraudulent transaction. File a written complaint with the bank citing RBI's limited liability guidelines.

20. Data privacy breach/misuse: Document how data was misused. File a complaint with the organization's Grievance Officer. Escalate to the Data Protection Board of India (under the Digital Personal Data Protection Act, 2023) or file at cybercrime.gov.in for serious cases.

21. Police refusing to register FIR: Police must register an FIR for cognizable offences. Submit the complaint in writing with an acknowledgment request. If refused, send it by registered post to the Superintendent of Police, or approach the Magistrate to direct registration. Relevant law: Bharatiya Nagarik Suraksha Sanhita, 2023, Section 173 (replaced CrPC Section 154).

22. Bail process: For bailable offences, bail is a right, often granted at the police station. For non-bailable offences, bail is sought from a Magistrate or higher court. Anticipatory bail can be applied for in advance from Sessions/High Court if arrest is anticipated. Free legal aid lawyers are available if unaffordable.

23. Cheque bounce: Send a legal demand notice within 30 days of the bounce, demanding payment within 15 days. If unpaid, file a criminal complaint in Magistrate's Court within 1 month. Relevant law: Section 138, Negotiable Instruments Act, 1881.

24. Defamation: Can be pursued as both a civil suit for damages and a criminal complaint. Document the statement, send a legal notice demanding retraction, then escalate to Magistrate's Court or civil suit if needed. For online defamation, also report to the platform.

25. Builder delaying possession (real estate): Check if the project is registered with the state's RERA authority. File a complaint on the state RERA portal citing the promised possession date — RERA can order compensation, interest, or refund. Relevant law: RERA Act, 2016.

26. Medical negligence: Collect medical records and reports. File a complaint with the State Medical Council for professional misconduct, and a consumer complaint via e-Daakhil for compensation. For serious harm, consult a lawyer about a civil suit.

27. Insurance claim wrongly rejected: Request the rejection reason in writing. File with the Insurance Ombudsman (free, no lawyer needed) or a consumer complaint via e-Daakhil for deficiency in service.

28. Bank/recovery agent harassment: Recovery agents must follow RBI's fair practices code. Document harassment, file a written complaint with the bank's Grievance Redressal Officer, and escalate to the RBI Banking Ombudsman if unresolved.

29. Notice period dues withheld: Review the appointment letter for notice period and buyout terms. Request full and final settlement and relieving letter in writing. If withheld unreasonably, raise with the Labour Commissioner's office.

30. Gig/contract worker rights: Check if the platform is registered for state gig worker welfare schemes under the Code on Social Security, 2020. Contract workers under a principal employer may be covered by the Contract Labour Act for minimum wage and safety. Unpaid dues can be raised with the Labour Commissioner's office.

31. Minimum wage violation: Check the state's notified minimum wage for the job category. Keep wage records as proof, and file a complaint with the state's Labour Commissioner's office under the Code on Wages, 2019. Group complaints are permitted.

32. Divorce process: Can be mutual (both spouses agree, faster) or contested (grounds like cruelty/desertion proven in Family Court). Applicable law depends on how the marriage was registered — Hindu Marriage Act, 1955 or Special Marriage Act, 1954 or other personal law.

33. Child custody: Decided based on the child's best interests, considering age, needs, and preference if old enough. Filed via a custody petition in Family Court under the Guardians and Wards Act, 1890 or applicable personal law. Interim custody/visitation can be requested while pending.

34. Senior citizen rights/elder abuse: Senior citizens have a legal right to maintenance from children under the Maintenance and Welfare of Parents and Senior Citizens Act, 2007. File before the district's Maintenance Tribunal (no lawyer needed). Property transferred on a broken promise of care can be reversed under the Act. Call the Senior Citizens' Helpline (14567).

35. Live-in relationship rights: Domestic Violence Act protections (protection orders, residence rights, monetary relief) extend to live-in relationships resembling marriage. Maintenance claims are case-specific. Children have the same legal rights as those born in marriage.

36. Whistleblower / reporting corruption: For government corruption, file with the Central Vigilance Commission (cvc.gov.in) or the state Lokayukta, often confidentially. Private-sector fraud can be reported via internal whistleblower policies, or to SEBI/Serious Fraud Investigation Office for serious financial fraud. Relevant law: Whistle Blowers Protection Act, 2014.
`;

const SYSTEM_PROMPT = `You are LegalAssistant, a plain-language legal information helper for people in India, covering tenant rights, consumer rights, workplace rights, RTI, domestic violence, cyber crime, criminal matters, property, and civic rights.

Rules:
- Answer ONLY using the reference material below. Do not invent laws, sections, or procedures not present in it.
- If the question is outside this reference material, say you don't have verified information on that specific topic yet, and suggest the person use the "Find legal aid" tab to talk to a real legal aid clinic.
- You give general information, not legal advice. Never claim to be a lawyer or guarantee an outcome.
- Keep answers under 120 words, in simple, everyday language — avoid legal jargon where possible.
- Do not diagnose the person's exact legal standing; describe the general right/process and point them to legal aid for their specific situation.

Reference material:
${KNOWLEDGE_BASE}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body || {};
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Missing 'question' in request body" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: question.trim() }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.3,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return res.status(502).json({ error: "AI service returned an error" });
    }

    const data = await geminiResponse.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate an answer right now.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Gemini request failed:", err);
    return res.status(500).json({ error: "Failed to get an answer from the AI service" });
  }
}
