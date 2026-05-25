const formArea = document.querySelector('#form-area');
const noteText = document.querySelector('#note-text');
const copyBtn = document.querySelector('#copy-note');
const saveBtn = document.querySelector('#save-note');
const savedList = document.querySelector('#saved-list');
const clearNotesButton = document.querySelector('#clear-notes');
const templateList = document.querySelector('#template-list');
const headerTitle = document.querySelector('header h1');

const STORAGE_KEY = 'dental-notes-state';
let savedNotes = [];

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const templates = {
  'new-assessment': [
    {
      label: 'Attends',
      key: 'reasonForAttendance',
      hasNotes: false,
      options: [
        'alone',
        'with partner',
        'with child'
      ]
    },
    {
      label: 'Medical History',
      key: 'medicalHistory',
      options: [
        'Medical history checked, updated',
        'Pt reports no significant medical history',
        'significant cardiac event within last 6m',
        'taking blood thinning medication',
        'poorly controlled diabetes',
        'respiratory disease',
        'immunosuppressant medication',
        'taking IV bisphosphonates',
        'pt is taking polypharmacy',
        'liver disease',
        'kidney disease',
        'allergies as noted on MH form'
      ]
    },
    {
      label: 'Patient complains of',
      key: 'chiefComplaint',
      options: [
        'Nil concerns',
        'Pain',
        'Sensitivity',
        'Broken tooth',
        'Missing tooth',
        'Bleeding gums',
        'Gum recession',
        'Swelling/infection',
        'Wisdom tooth issues',
        'TMJ/jaw issues',
        'Loose tooth',
        'Bite/alignment issues',
        'Aesthetic concerns',
        'Tooth wear/grinding',
        'Dry mouth',
        'Ulcers/soft tissue issue',
        'Trauma/injury',
        'Denture/prosthesis issue',
        'Implant issue',
        'Oral hygiene concern'
      ]
    },
    {
      label: 'Pain details',
      key: 'painDetails',
      dependsOn: { key: 'chiefComplaint', value: 'Pain' },
      subfields: [
        {
          label: 'Site',
          key: 'painSite',
          type: 'checkbox',
          options: [
            'Upper right',
            'Upper left',
            'Lower right',
            'Lower left',
            'Generalised/multiple sites'
          ]
        },
        {
          label: 'Onset',
          key: 'painOnset',
          type: 'text'
        },
        {
          label: 'Character',
          key: 'painCharacter',
          type: 'checkbox',
          options: [
            'Sharp',
            'Dull',
            'Throbbing',
            'Burning',
            'Aching',
            'Stabbing',
            'Tender',
            'Pressure-like',
            'Tingling'
          ]
        },
        {
          label: 'Radiating',
          key: 'painRadiating',
          type: 'checkbox',
          options: ['Yes', 'No']
        },
        {
          label: 'Where to',
          key: 'painRadiatingWhere',
          type: 'checkbox',
          dependsOn: { key: 'painRadiating', value: 'Yes' },
          options: [
            'TMJ',
            'Side of face',
            'Lower jaw',
            'Neck',
            'Temple region'
          ]
        },
        {
          label: 'Associated symptoms',
          key: 'painAssociated',
          type: 'text'
        },
        {
          label: 'Timing',
          key: 'painTiming',
          type: 'checkbox',
          options: ['Intermittent', 'Constant']
        },
        {
          label: 'Exacerbating factors',
          key: 'painExacerbating',
          type: 'text'
        },
        {
          label: 'Severity',
          key: 'painSeverity',
          type: 'checkbox',
          options: ['1','2','3','4','5','6','7','8','9','10']
        }
      ]
    },
    {
      label: 'Social History',
      key: 'socialHistory',
      subfields: [
        {
          label: 'Smoking',
          key: 'smoking',
          type: 'checkbox',
          options: [
            'Non-smoker, never smoked',
            'Previous smoker',
            'Current smoker',
            'Currently using e-cigarettes'
          ]
        },
        {
          label: 'Alcohol intake',
          key: 'alcohol',
          type: 'checkbox',
          options: [
            'Does not consume alcohol',
            'Consumes alcohol within NHS recommended weekly limit of 14 units per week',
            'Consumes alcohol in excess of NHS recommended weekly limit of 14 units per week'
          ]
        },
        {
          label: 'Stress levels',
          key: 'stressLevels',
          type: 'checkbox',
          options: [
            'High',
            'Medium',
            'Low',
            'Low currently but history of high stress'
          ]
        }
      ]
    },
    {
      label: 'Dental History',
      key: 'dentalHistory',
      subfields: [
        {
          label: 'Last dental visit',
          key: 'dentalLastVisit',
          type: 'checkbox',
          options: ['12m or less', '1-5y', 'More than 5y']
        },
        {
          label: 'Dental attendance',
          key: 'dentalAttendance',
          type: 'checkbox',
          options: ['Frequent attender', 'Infrequent attender', 'Attendance motivated by pain/issues']
        },
        {
          label: 'Anxiety surrounding dental visits',
          key: 'dentalAnxiety',
          type: 'checkbox',
          options: ['No', 'Yes']
        },
        {
          label: 'Brushing habits',
          key: 'dentalBrushing',
          type: 'checkbox',
          options: ['Less than daily', 'Once daily', 'Twice daily', 'More than twice daily', 'Manual toothbrush', 'Electric toothbrush']
        },
        {
          label: 'Toothpaste',
          key: 'dentalToothpaste',
          type: 'checkbox',
          options: ['Using fluoride free toothpaste', 'Using toothpaste containing less than 1450ppm fluoride', 'Using at least 1450ppm fluoride toothpaste'],
          conditionalText: {
            'Using fluoride free toothpaste': 'Enquired regarding reasons for this; discussed associated caries risk and benefits of fluoride toothpaste.'
          }
        },
        {
          label: 'Interdental cleaning',
          key: 'dentalInterdental',
          type: 'checkbox',
          options: ['Nil', 'Infrequent/irregular', 'Daily', 'Floss', 'Interdental brushes', 'Interdental picks', 'Water flosser']
        },
        {
          label: 'Diet',
          key: 'dentalDiet',
          type: 'checkbox',
          options: ['Patient reports cariogenic diet', 'Patient reports non-cariogenic diet', 'Frequent consumption of free-sugars', 'Frequent consumption of fizzy/acidic drinks', 'Frequent consumption of dietary acids']
        }
      ]
    },
    {
      label: 'Extraoral examination',
      key: 'extraoralExamination',
      hasNotes: true,
      subfields: [
        {
          label: 'Facial examination',
          key: 'facialExamination',
          type: 'checkbox',
          options: ['Symmetrical', 'Asymmetrical', 'Swelling', 'Trauma', 'Skin lesion']
        },
        {
          label: 'Skeletal class',
          key: 'skeletalClass',
          type: 'radios',
          options: ['1', '2', '3']
        },
        {
          label: 'TMJ',
          key: 'tmj',
          type: 'checkbox',
          options: ['NAD', 'Clicking', 'Crepitus', 'Muscle tenderness - scores from 0-3 on palpation', 'Limited opening', 'Deviation to LHS on opening', 'Deviation to RHS on opening']
        },
        {
          label: 'Deep masseter',
          key: 'tmjDeepMasseter',
          type: 'radios',
          dependsOn: { key: 'tmj', value: 'Muscle tenderness - scores from 0-3 on palpation' },
          options: ['0', '1', '2', '3']
        },
        {
          label: 'Superficial masseter',
          key: 'tmjSuperficialMasseter',
          type: 'radios',
          dependsOn: { key: 'tmj', value: 'Muscle tenderness - scores from 0-3 on palpation' },
          options: ['0', '1', '2', '3']
        },
        {
          label: 'Temporalis',
          key: 'tmjTemporalis',
          type: 'radios',
          dependsOn: { key: 'tmj', value: 'Muscle tenderness - scores from 0-3 on palpation' },
          options: ['0', '1', '2', '3']
        },
        {
          label: 'Lymph nodes',
          key: 'lymphNodes',
          type: 'checkbox',
          options: ['Non-palpable', 'Palpable/tender', 'Enlarged']
        }
      ]
    },
    {
      label: 'Intraoral examination',
      key: 'intraoralExamination',
      hasNotes: true,
      subfields: [
        {
          label: 'General',
          key: 'intraoralGeneral',
          type: 'checkbox',
          options: ['NAD', 'Unrestored dentition', 'Minimally restored dentition', 'Heavily restored dentition', 'Heavy plaque/calculus', 'Generalised inflammation', 'Xerostomia noted']
        },
        {
          label: 'Soft tissues (labial and buccal mucosa, tongue, FOM, hard and soft palate)',
          key: 'intraoralSoftTissues',
          type: 'checkbox',
          options: ['NAD', 'Ulceration present', 'White patches / leukoplakia suspected', 'Erythematous patches', 'Lichen planus-like changes', 'Candida infection suspected', 'Pigmentation noted', 'Evidence of cheek biting/clenching']
        }
      ]
    },
    {
      label: 'BPE',
      key: 'bpe',
      subfields: [
        {
          label: 'URQ',
          key: 'bpeUrq',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        },
        {
          label: 'Upper anteriors',
          key: 'bpeUpperAnteriors',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        },
        {
          label: 'ULQ',
          key: 'bpeUlq',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        },
        {
          label: 'LLQ',
          key: 'bpeLlq',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        },
        {
          label: 'Lower anteriors',
          key: 'bpeLowerAnteriors',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        },
        {
          label: 'LRQ',
          key: 'bpeLrq',
          type: 'bpe',
          options: ['1', '2', '3', '4']
        }
      ]
    },
    {
      label: 'Periodontal Assessment',
      key: 'periodontalAssessment',
      subfields: [
        {
          label: 'Findings',
          key: 'periodontalAssessmentList',
          type: 'checkbox',
          options: ['Healthy gingiva', 'Gingivitis evident', 'Generalised gingival inflammation', 'Localised gingival inflammation', 'Bleeding on probing present', 'Recession present', 'Furcation involvement present', 'Mobility present (grade 1/2/3)']
        }
      ]
    },
    {
      label: 'Dental assessment',
      key: 'dentalAssessment',
      subfields: [
        {
          label: 'Oral hygiene',
          key: 'oralHygiene',
          type: 'checkbox',
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor']
        },
        {
          label: 'Caries',
          key: 'caries',
          type: 'text',
          hasNotes: true
        },
        {
          label: 'Leaking or defective restorations',
          key: 'leakingRestorations',
          type: 'text',
          hasNotes: true
        },
        {
          label: 'Incisal relationship',
          key: 'incisalRelationship',
          type: 'radios',
          options: ['Class I', 'Class II div I', 'Class II div II', 'Class III']
        },
        {
          label: 'Guidance LHS',
          key: 'guidanceLhs',
          type: 'checkbox',
          options: ['Group function', 'Canine guidance', 'Anterior guidance', 'Working side interference', 'No non-working side interferences']
        },
        {
          label: 'Guidance RHS',
          key: 'guidanceRhs',
          type: 'checkbox',
          options: ['Group function', 'Canine guidance', 'Anterior guidance', 'Working side interference', 'No non-working side interferences']
        },
        {
          label: 'Toothwear assessment',
          key: 'toothwearAssessmentIntro',
          type: 'static',
          text: 'Toothwear assessment'
        },
        {
          label: 'Severity',
          key: 'toothwearSeverity',
          type: 'checkbox',
          options: [
            'No clinically significant toothwear',
            'Into enamel',
            'Into dentine',
            'Into dentine approaching pulp',
            'Cervical toothwear'
          ]
        },
        {
          label: 'Suspected aetiology',
          key: 'toothwearAetiology',
          type: 'checkbox',
          options: ['Attrition predominant', 'Erosion predominant', 'Abrasion predominant', 'Abfraction present', 'Multifactorial wear suspected']
        },
        {
          label: 'Distribution',
          key: 'toothwearDistribution',
          type: 'checkbox',
          options: ['Posterior dentition', 'Anterior dentition', 'Generalised, affecting most teeth']
        },
        {
          label: 'Risk factors',
          key: 'toothwearRiskFactors',
          type: 'checkbox',
          options: ['Clenching suspected', 'Parafunctional activity reported', 'Dietary acid exposure', 'Gastro-oesophageal reflux risk', 'Xerostomia contributing factor', 'No clear risk factors identified']
        }
      ]
    },
    {
      label: 'Diagnoses',
      key: 'diagnoses',
      subfields: [
        {
          label: 'Periodontal',
          key: 'diagnosisPeriodontal',
          type: 'checkbox',
          options: [
            'Clinical gingival health',
            'Plaque-induced gingivitis',
            'Localised stable periodontitis',
            'Generalised stable periodontitis',
            'Generalised Stage I Grade B periodontitis',
            'Generalised Stage II Grade B periodontitis',
            'Generalised Stage III Grade B periodontitis',
            'Generalised Stage III Grade C periodontitis'
          ],
          conditionalText: {
            'Plaque-induced gingivitis': 'Plaque-induced gingivitis discussed with patient. Oral hygiene instruction provided including brushing technique and interdental cleaning. Advised that improved plaque control is required to reduce gingival inflammation and bleeding and also to prevent progression to periodontal disease.',
            'Localised stable periodontitis': 'Stable periodontitis discussed with patient. Praise given for maintaining periodontal health, however stressed the importance of maintenance, both at home and professional to ensure relapse does not occur. Explained periodontal disease cannot be cured, only stabilised.',
            'Generalised stable periodontitis': 'Stable periodontitis discussed with patient. Praise given for maintaining periodontal health, however stressed the importance of maintenance, both at home and professional to ensure relapse does not occur. Explained periodontal disease cannot be cured, only stabilised.',
            'Generalised Stage I Grade B periodontitis': 'Periodontitis diagnosis discussed with patient, including explanation of plaque biofilm as the primary aetiological factor and the role of contributing risk factors where relevant. Explained sequelae of disease progression including periodontal attachment loss, bone loss, gingival recession, tooth mobility and potential tooth loss if untreated. Oral hygiene instruction provided including toothbrushing and interdental cleaning techniques. Emphasised importance of effective plaque control, regular periodontal maintenance and ongoing monitoring.',
            'Generalised Stage II Grade B periodontitis': 'Periodontitis diagnosis discussed with patient, including explanation of plaque biofilm as the primary aetiological factor and the role of contributing risk factors where relevant. Explained sequelae of disease progression including periodontal attachment loss, bone loss, gingival recession, tooth mobility and potential tooth loss if untreated. Oral hygiene instruction provided including toothbrushing and interdental cleaning techniques. Emphasised importance of effective plaque control, regular periodontal maintenance and ongoing monitoring.',
            'Generalised Stage III Grade B periodontitis': 'Periodontitis diagnosis discussed with patient, including explanation of plaque biofilm as the primary aetiological factor and the role of contributing risk factors where relevant. Explained sequelae of disease progression including periodontal attachment loss, bone loss, gingival recession, tooth mobility and potential tooth loss if untreated. Oral hygiene instruction provided including toothbrushing and interdental cleaning techniques. Emphasised importance of effective plaque control, regular periodontal maintenance and ongoing monitoring.',
            'Generalised Stage III Grade C periodontitis': 'Periodontitis diagnosis discussed with patient, including explanation of plaque biofilm as the primary aetiological factor and the role of contributing risk factors where relevant. Explained sequelae of disease progression including periodontal attachment loss, bone loss, gingival recession, tooth mobility and potential tooth loss if untreated. Oral hygiene instruction provided including toothbrushing and interdental cleaning techniques. Emphasised importance of effective plaque control, regular periodontal maintenance and ongoing monitoring.'
          }
        },
        {
          label: 'Caries',
          key: 'diagnosisCaries',
          type: 'text',
          hasNotes: true
        },
        {
          label: 'NCTSL',
          key: 'diagnosisNctsl',
          type: 'checkbox',
          options: [
            'No clinically significant toothwear',
            'Toothwear into enamel, generalised',
            'Toothwear into enamel, localised',
            'Toothwear into dentine, generalised',
            'Toothwear into dentine, localised',
            'Toothwear close to/into pulpal complex on one or more teeth'
          ],
          conditionalText: {
            'Toothwear into enamel, generalised': 'Toothwear discussed with patient, including explanation of possible aetiological factors such as erosion, attrition and abrasion, and contributing risk factors where relevant. Explained potential sequelae including progressive loss of tooth structure, dentine exposure, sensitivity, reduced aesthetics, occlusal changes and possible future restorative requirements if progression continues. Preventive advice provided regarding dietary acids, toothbrushing habits and parafunctional activity where appropriate. Advised regarding importance of monitoring and regular review.',
            'Toothwear into enamel, localised': 'Toothwear discussed with patient, including explanation of possible aetiological factors such as erosion, attrition and abrasion, and contributing risk factors where relevant. Explained potential sequelae including progressive loss of tooth structure, dentine exposure, sensitivity, reduced aesthetics, occlusal changes and possible future restorative requirements if progression continues. Preventive advice provided regarding dietary acids, toothbrushing habits and parafunctional activity where appropriate. Advised regarding importance of monitoring and regular review.',
            'Toothwear into dentine, generalised': 'Toothwear discussed with patient, including explanation of possible aetiological factors such as erosion, attrition and abrasion, and contributing risk factors where relevant. Explained potential sequelae including progressive loss of tooth structure, dentine exposure, sensitivity, reduced aesthetics, occlusal changes and possible future restorative requirements if progression continues. Preventive advice provided regarding dietary acids, toothbrushing habits and parafunctional activity where appropriate. Advised regarding importance of monitoring and regular review.',
            'Toothwear into dentine, localised': 'Toothwear discussed with patient, including explanation of possible aetiological factors such as erosion, attrition and abrasion, and contributing risk factors where relevant. Explained potential sequelae including progressive loss of tooth structure, dentine exposure, sensitivity, reduced aesthetics, occlusal changes and possible future restorative requirements if progression continues. Preventive advice provided regarding dietary acids, toothbrushing habits and parafunctional activity where appropriate. Advised regarding importance of monitoring and regular review.',
            'Toothwear close to/into pulpal complex on one or more teeth': 'Toothwear discussed with patient, including explanation of possible aetiological factors such as erosion, attrition and abrasion, and contributing risk factors where relevant. Explained potential sequelae including progressive loss of tooth structure, dentine exposure, sensitivity, reduced aesthetics, occlusal changes and possible future restorative requirements if progression continues. Preventive advice provided regarding dietary acids, toothbrushing habits and parafunctional activity where appropriate. Advised regarding importance of monitoring and regular review.'
          }
        }
      ]
    },
    {
      label: 'Risk Assessment',
      key: 'riskAssessment',
      subfields: [
        {
          label: 'Periodontal disease',
          key: 'riskPeriodontalDisease',
          type: 'checkbox',
          options: ['Low', 'Moderate', 'High']
        },
        {
          label: 'Caries',
          key: 'riskCaries',
          type: 'checkbox',
          options: ['Low', 'Moderate', 'High']
        },
        {
          label: 'NCTSL',
          key: 'riskNctsl',
          type: 'checkbox',
          options: ['Low', 'Moderate', 'High']
        },
        {
          label: 'Oral Cancer',
          key: 'riskOralCancer',
          type: 'checkbox',
          options: ['Low', 'Moderate', 'High due to smoking', 'High due to alcohol intake', 'High due to smoking and alcohol intake']
        }
      ]
    },
    {
      label: 'Discussions',
      key: 'discussions',
      hasNotes: true,
      options: [
        'Caries into enamel',
        'Caries into dentine',
        'Caries close to/into pulp',
        'Toothwear/parafunction mild',
        'Toothwear/parafunction moderate/severe',
        'Missing tooth',
        'Missing teeth',
        'Gingivitis',
        'Periodontal disease',
        'Bleaching',
        'Unrestorable tooth',
        'Generic OHI',
        'High caries risk'
      ],
      conditionalText: {
        'Caries into enamel': `Discussed presence of early enamel caries with patient, showed on radiographs. Explained that lesions are currently at a stage where they may be stabilised with improved oral hygiene measures, reduced sugar intake and fluoride exposure. Provided OHI including twice-daily brushing with fluoride toothpaste, interdental cleaning, reduction in frequency of sugary/acidic food and drinks, and advice regarding diet and oral hygiene habits. Discussed preventive and treatment options including fluoride varnish application, high-fluoride toothpaste where appropriate, monitoring/review, and minimally invasive restorative treatment should lesions progress. Patient understood and advised regarding importance of regular recall and preventive care.`,
        'Caries into dentine': `Discussed presence of dentinal caries with patient, explained that decay has progressed beyond enamel and is now into dentine, indicating irreversible disease that will not remineralise and requires operative management (composite restoration planned, however if decay is more extensive than anticipated, tooth may require an indirect restoration). Reviewed contributing factors including plaque accumulation and dietary sugar frequency. Discussed treatment options including selective caries removal and restoration, stepwise excavation where appropriate, or more extensive treatment such as pulp therapy or extraction if lesion is deep or symptoms/signs of pulpal involvement develop. Explained importance of prompt treatment to prevent progression to pulpal complex. Patient advised regarding prognosis, need for regular review, and preventive measures to reduce risk of recurrence.`,
        'Caries close to/into pulp': `Discussed with patient the presence of deep caries extending close to/into the pulp, with signs consistent with irreversible pulpal involvement. Explained that the tooth is not suitable for simple restorative treatment alone and that root canal treatment is indicated to remove infected pulp tissue, disinfect the root canal system, and retain the tooth. Reviewed alternative option of extraction, including risks, benefits, and consequences of no treatment (progression of infection, pain, swelling, potential spread of infection).

Explained that definitive treatment will involve root canal therapy followed by appropriate definitive restoration (e.g. cuspal coverage crown) to reduce risk of fracture and reinfection. Patient informed about procedure steps, potential need for multiple visits, possible post-operative symptoms, and need for good long-term maintenance. Patient understands and will consider options.`,
        'Toothwear/parafunction mild': `Discussed findings consistent with mild tooth surface loss consistent with parafunctional activity (e.g. clenching/grinding). Explained likely contributing factors including bruxism and occlusal overload, and the potential for progression leading to increased sensitivity, further wear, and risk of restorative failure if unmanaged.

Provided OHI and stressed the importance of being aware of/avoiding parafunctional habits where possible, awareness of daytime clenching, stress management advice, and use of a soft diet in periods of symptom flare if required. Advised use of fluoride toothpaste to reduce sensitivity and support remineralisation of exposed dentine where applicable.

Discussed treatment options including provision of a hard acrylic occlusal splint/night guard to protect teeth from further wear and reduce load on the dentition, with explanation of need for compliance and regular review/adjustment. Pt informed of costs which range from approximately £120 for the most basic retainer-style splint, £320 for moderate strength splint and £700 for most durable splint type. Also discussed monitoring of toothwear progression and potential future restorative options if symptoms or wear progress. Patient informed and understands treatment rationale and importance of compliance with splint therapy. Regular review advised.`,
        'Toothwear/parafunction moderate/severe': `Discussed findings of severe tooth surface loss consistent with significant parafunctional activity (bruxism/clenching), with advanced toothwear affecting multiple teeth. Explained that the condition is likely multifactorial and, if unmanaged, may lead to ongoing rapid progression, increased sensitivity, loss of tooth structure, compromised function, increased risk of restorative failure and failure of the remaining dentition.

Provided OHI and stressed the importance of being aware of/avoiding parafunctional habits where possible, awareness of daytime clenching, stress management advice, and use of a soft diet in periods of symptom flare if required. Advised use of fluoride toothpaste to reduce sensitivity and support remineralisation of exposed dentine where applicable.

Discussed treatment options including provision of a full coverage hard occlusal splint/night guard to protect remaining tooth structure and redistribute occlusal forces, with emphasis on long-term compliance and regular review/adjustment. Pt informed of costs which range from approximately £320 for moderate strength splint and £700 for most durable splint type. Explained that definitive management may also involve staged restorative rehabilitation (e.g. composite build-ups, adhesive restorations, or full mouth rehabilitation depending on severity and progression) to provide protection to the underlying teeth. Advised cost of this will vary depending on materials used, amount of teeth to be treated, and a definitive cost can be provided after an initial treatment planning phase, the cost of which is approximately £700. Patient informed that treatment is primarily protective and preventative at this stage, with goal of halting further wear rather than fully reversing damage. Patient understands diagnosis, risks of non-intervention. Regular follow-up advised.`,
        'Missing tooth': `Discussed missing tooth with patient and implications of space loss, including potential effects on occlusion, aesthetics, function, and drifting/over-eruption of adjacent and opposing teeth if left unrestored. Reviewed treatment options for tooth replacement.

Options discussed included: no replacement with monitoring; removable partial denture (non-invasive and lower cost but bulkier, requires removal and adaptation period); fixed bridge (good aesthetics and function, shorter treatment time but requires preparation of adjacent teeth and carries risk of long-term load on abutment teeth); and dental implant (independent of adjacent teeth, good function and aesthetics, helps preserve bone, but involves surgery, longer treatment time, higher cost, and not suitable for all patients depending on bone and medical factors).

Approximate costs discussed as: £800 for single tooth denture, £1200+ for bridge depending on teeth and span, £3500+ for implant.

Discussed that suitability of each option depends on clinical assessment, bone levels, oral hygiene, and patient preference. Patient to consider preferences; will review and proceed with chosen treatment plan following further assessment and discussion. Regular follow-up of all options advised.`,
        'Missing teeth': `Discussed multiple missing teeth and associated functional, aesthetic, and occlusal implications, including reduced chewing efficiency, potential drifting/over-eruption of remaining dentition, and impact on long-term stability if left unrestored. Explained that treatment planning is dependent on clinical and radiographic assessment, periodontal status, and patient goals.

Reviewed replacement options including no replacement with monitoring; removable full/partial denture(s) (cost-effective and non-invasive but may be bulkier, require adaptation and maintenance, and may affect comfort/stability depending on design); fixed bridgework where appropriate (improved aesthetics and function but requires preparation of adjacent teeth and may be limited in cases of multiple saddles); and dental implants (independent of adjacent teeth, improved function and preservation of alveolar bone, but involves surgical procedures, longer treatment time, higher cost, and may require staged or combined approaches such as bone augmentation). Explained that a combination of options may be required depending on distribution and extent of tooth loss.

Approximate costs discussed as: £800+ per arch for denture, £1200+ for bridge depending on teeth and span, £3500+ for implant.

Patient advised regarding advantages, limitations, and maintenance requirements of each option and encouraged to consider preferences prior to definitive treatment planning. Further assessment and radiographic evaluation required. Regular review advised.`,
        'Gingivitis': `Discussed findings consistent with gingivitis with patient, explaining that this is a reversible inflammatory condition of the gingival tissues caused primarily by plaque accumulation. Explained that if left untreated, gingivitis may progress to periodontitis with potential for attachment loss and tooth mobility. Reinforcement of the importance of plaque control in prevention and resolution of inflammation. Discussed contributing factors including plaque retention, diet, and smoking where relevant.

Advised professional plaque removal and scaling as indicated, with review to assess response to improved home care. Emphasised that gingival health is expected to improve significantly with effective plaque control within 1–2 weeks. Patient advised regarding importance of regular maintenance and routine dental reviews. Patient understands.`,
        'Periodontal disease': `Discussed findings consistent with periodontal disease with patient, explaining that this is a chronic inflammatory condition affecting the supporting structures of the teeth, resulting in loss of periodontal attachment and alveolar bone. Explained that if left untreated, it may progress to increased pocketing, gingival recession, tooth mobility, drifting, and eventual tooth loss.

Reviewed contributing factors including plaque accumulation, subgingival calculus, smoking, systemic factors (e.g. diabetes where relevant), and oral hygiene practices. Emphasised that periodontal disease is a long-term condition requiring ongoing maintenance, both at home and professional, rather than a one-off treatment.

Advised on risk factor modification including smoking cessation advice where appropriate and optimisation of systemic health.

Discussed treatment options including non-surgical periodontal therapy (scaling and root surface debridement), reassessment following initial therapy, and potential need for further intervention such as localised periodontal surgery, laser therapy or extraction of hopeless teeth in advanced cases. Emphasised importance of periodontal maintenance therapy and regular supportive recall. Patient informed of diagnosis, prognosis, and need for ongoing active and supportive periodontal care.`,
        'Bleaching': `Discussed tooth whitening (bleaching) with patient, including indication for improving tooth shade and expected outcomes. Explained options including at-home whitening with custom trays and dentist-supervised whitening gels as first-line treatment. Advised that existing restorations will not change colour and may require replacement for shade matching following treatment. Reviewed potential risks including transient tooth sensitivity and gingival irritation, and importance of adherence to instructions and safe use under dental supervision. Patient informed of need for prior oral health assessment and caries/periodontal stability before commencing treatment. Patient understands.`,
        'Unrestorable tooth': `Discussed unrestorable tooth with pt, advised that due to extent of caries/structural loss, prognosis is deemed hopeless. Explained that restorative options are not viable and that extraction is the recommended treatment to prevent ongoing pain, infection, and further complications.

Reviewed treatment options including extraction under local anaesthetic or sedation, with discussion of risks and benefits, as well as potential need for surgical extraction depending on clinical complexity. Discussed consequences of non-treatment including progression of infection, pain, swelling, and possible spread of infection.

Discussed replacement options following healing where appropriate, including removable prosthesis, bridgework, or dental implant, depending on clinical suitability and patient preference. Provided OHI and reinforced importance of ongoing oral hygiene. Patient informed and understands diagnosis and treatment plan and agrees to proceed / will consider options.`,
        'Generic OHI': `Provided general oral hygiene instruction (OHI). Advised twice-daily brushing for at least 2 minutes using a fluoride toothpaste, ensuring cleaning along the gum margins. Recommended daily interdental cleaning (floss or interdental brushes as appropriate) to remove plaque between teeth. Advised limiting frequency of sugary and acidic foods and drinks, particularly between meals. Encouraged regular dental attendance for preventive care and early detection of disease. Discussed importance of maintaining good oral hygiene to reduce risk of caries, gingivitis, and periodontal disease. Patient understands.`,
        'High caries risk': `Patient identified as being high caries risk at this time. OHI reinforced and dietary advice provided, including reducing frequency and amount of sugar/dietary acid intake. Advised twice daily brushing with fluoride toothpaste and to spit, not rinse after brushing. Discussed fluoride use and importance of regular dental attendance and ongoing monitoring.`
      }
    },
    {
      label: 'Treatment plan',
      key: 'treatmentPlan',
      hasNotes: true
    },
    {
      label: 'Recalls, as per NICE guidelines',
      key: 'recalls',
      subfields: [
        {
          label: 'Dental recall interval',
          key: 'dentalRecallInterval',
          type: 'radios',
          options: ['3m', '6m', '12m']
        },
        {
          label: 'Periodontal recall interval',
          key: 'periodontalRecallInterval',
          type: 'radios',
          options: ['3m', '6m', '12m']
        }
      ]
    }
  ]
};

// Human-friendly titles for each template key
const templateTitles = {
  'new-assessment': 'New Patient Examination',
  'recall-examination': 'Recall Examination',
  'child-examination': 'Child Examination',
  'composite-restoration': 'Composite Restoration',
  'extraction': 'Extraction',
  'emergency': 'Emergency',
  'bw-pa-radiographs': 'BW/PA Radiographs',
  'opg-radiograph': 'OPG',
  'primary-denture-impressions': 'Primary Denture Impressions',
  'secondary-denture-impressions': 'Secondary Denture Impressions',
  'bite-registration': 'Bite Registration',
  'denture-try-in': 'Denture Try In',
  'denture-fit': 'Denture Fit'
};

const templateGroups = [
  {
    title: 'Exam Appointments',
    templates: ['new-assessment', 'recall-examination', 'child-examination']
  },
  {
    title: 'Radiograph Reports',
    templates: ['bw-pa-radiographs', 'opg-radiograph']
  },
  {
    title: 'Restorative',
    templates: ['composite-restoration']
  },
  {
    title: 'Dentures',
    templates: [
      'primary-denture-impressions',
      'secondary-denture-impressions',
      'bite-registration',
      'denture-try-in',
      'denture-fit'
    ]
  },
  {
    title: 'Other Templates',
    templates: ['extraction', 'emergency']
  }
];

let currentTemplate = 'new-assessment';

function titleize(key) {
  return key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function renderSidebar() {
  if (!templateList) return;
  templateList.innerHTML = '';

  const renderTemplateItem = (key, parentList) => {
    const li = document.createElement('li');
    li.className = 'template-item';
    li.textContent = templateTitles[key] || titleize(key);
    li.dataset.key = key;
    li.addEventListener('click', () => {
      document.querySelectorAll('#template-list .template-item').forEach((n) => n.classList.remove('active'));
      li.classList.add('active');
      renderTemplate(key);
      buildNote();
    });
    if (key === currentTemplate) li.classList.add('active');
    parentList.appendChild(li);
  };

  templateGroups.forEach((group) => {
    const groupItem = document.createElement('li');
    groupItem.className = 'template-group';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'template-group-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = group.title;

    const childList = document.createElement('ul');
    childList.className = 'template-group-list';

    group.templates.forEach((key) => {
      if (templates[key]) {
        renderTemplateItem(key, childList);
      }
    });

    const shouldOpen = group.templates.includes(currentTemplate);
    if (shouldOpen) {
      groupItem.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }

    button.addEventListener('click', () => {
      const isOpen = groupItem.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });

    groupItem.appendChild(button);
    groupItem.appendChild(childList);
    templateList.appendChild(groupItem);
  });
}

// Add other templates.
function cloneTemplateSection(key) {
  return JSON.parse(JSON.stringify(templates['new-assessment'].find((section) => section.key === key)));
}

const recallSectionKeys = [
  'reasonForAttendance',
  'medicalHistory',
  'chiefComplaint',
  'painDetails',
  'socialHistory',
  'dentalHistory',
  'extraoralExamination',
  'intraoralExamination',
  'bpe',
  'periodontalAssessment',
  'dentalAssessment',
  'diagnoses',
  'riskAssessment',
  'discussions',
  'treatmentPlan',
  'recalls'
];

templates['recall-examination'] = recallSectionKeys.map(cloneTemplateSection);
const recallDentalHistory = templates['recall-examination'].find((section) => section.key === 'dentalHistory');
if (recallDentalHistory?.subfields) {
  recallDentalHistory.subfields = recallDentalHistory.subfields.filter((subfield) => subfield.key !== 'dentalAnxiety');
}

const recallExtraoral = templates['recall-examination'].find((section) => section.key === 'extraoralExamination');
if (recallExtraoral?.subfields) {
  recallExtraoral.subfields = recallExtraoral.subfields.filter((subfield) => subfield.key !== 'skeletalClass');
}

const recallDentalAssessment = templates['recall-examination'].find((section) => section.key === 'dentalAssessment');
if (recallDentalAssessment?.subfields) {
  recallDentalAssessment.subfields = recallDentalAssessment.subfields.filter((subfield) => ![
    'incisalRelationship',
    'guidanceLhs',
    'guidanceRhs',
    'toothwearSeverity',
    'toothwearAetiology',
    'toothwearDistribution',
    'toothwearRiskFactors'
  ].includes(subfield.key));

  const toothwearHeadingIndex = recallDentalAssessment.subfields.findIndex((subfield) => subfield.key === 'toothwearAssessmentIntro');
  if (toothwearHeadingIndex !== -1) {
    recallDentalAssessment.subfields.splice(toothwearHeadingIndex + 1, 0, {
      label: 'Comparison since last dental examination',
      key: 'toothwearComparison',
      type: 'checkbox',
      options: ['No changes', 'Rapid rate of progression', 'Slow rate of progression']
    });
  }
}

templates['child-examination'] = [
  {
    label: 'Attends with',
    key: 'childAttends',
    options: ['Parent', 'Parents', 'Guardian', 'Siblings', 'Other']
  },
  {
    label: 'Medical History',
    key: 'childMedicalHistory',
    options: [
      'Medically fit and well',
      'Asthmatic',
      'Allergies (see MH for specifics)',
      'Autism/Autism Spectrum Disorder',
      'Anxiety',
      'Learning disability/developmental delay'
    ]
  },
  {
    label: 'Behaviour',
    key: 'childBehaviour',
    options: [
      'Pre-cooperative',
      'Un-cooperative',
      'Cooperative',
      'Requires support',
      'Anxious',
      'Happy to be at the dentist'
    ]
  },
  {
    label: 'Complains of',
    key: 'childComplaint',
    options: [
      'Nil concerns',
      'Pain',
      'Broken tooth/teeth',
      'Loose tooth/teeth',
      'Tooth colour concern',
      'Alignment concern',
      'Grinding/clenching teeth',
      'Digit sucking/dummy habit',
      'Eruption concerns',
      'Speech concerns'
    ]
  },
  {
    ...cloneTemplateSection('painDetails'),
    dependsOn: { key: 'childComplaint', value: 'Pain' }
  },
  {
    label: 'Dental History',
    key: 'childDentalHistory',
    subfields: [
      {
        label: 'Last dental visit',
        key: 'childDentalLastVisit',
        type: 'checkbox',
        options: ['First dental visit', 'Less than 12m', '1-2y', '2y+']
      },
      {
        label: 'Dental treatment history',
        key: 'childDentalTreatmentHistory',
        type: 'checkbox',
        options: [
          'Received basic dental treatment (fluoride varnish, fissure sealants etc)',
          'History of extractions',
          'History of restorations',
          'No dental treatment received previously'
        ]
      },
      {
        label: 'Brushing habits',
        key: 'childBrushing',
        type: 'checkbox',
        options: ['Less than daily', 'Once daily', 'Twice daily', 'Manual toothbrush', 'Electric toothbrush', 'Assisted brushing']
      },
      {
        label: 'Toothpaste',
        key: 'childToothpaste',
        type: 'checkbox',
        options: ['Fluoride free toothpaste', 'Low fluoride toothpaste', 'Toothpaste containing 1450ppm fluoride']
      },
      {
        label: 'Interdental cleaning',
        key: 'childInterdental',
        type: 'checkbox',
        options: ['Pt precooperative', 'Regular interdental cleaning', 'Irregular interdental cleaning']
      }
    ]
  },
  {
    label: 'Diet',
    key: 'childDiet',
    options: [
      'Cariogenic diet',
      'Low cariogenic diet',
      'pt consumes lots of sugary foods',
      'pt consumes lots of sugary drinks',
      'pt consumes lots of acidic foods/drinks'
    ]
  },
  {
    label: 'Extraoral examination',
    key: 'childExtraoralExamination',
    options: [
      'Symmetry, TMJ, facial appearance, lymph nodes all normal',
      'Obvious skeletal class II, otherwise NAD',
      'Obvious skeletal class III, otherwise NAD'
    ]
  },
  {
    label: 'Intraoral examination',
    key: 'childIntraoralExamination',
    subfields: [
      {
        label: 'Soft tissues',
        key: 'childSoftTissues',
        type: 'checkbox',
        hasNotes: true,
        options: [
          'Labial and buccal mucosa, tongue, FOM, hard and soft palate all normal',
          'Obvious abscess'
        ]
      },
      {
        label: 'Dentition',
        key: 'childDentition',
        type: 'checkbox',
        options: ['Teeth as charted', 'Well maintained dentition', 'Poorly maintained dentition', 'Multiple caries lesions']
      },
      {
        label: 'Oral hygiene',
        key: 'childOralHygiene',
        type: 'checkbox',
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Highlighted areas of plaque accumulation in mirror to pt and parent/guardian']
      },
      {
        label: 'BPE',
        key: 'childBpeIntro',
        type: 'static',
        text: 'BPE'
      },
      ...cloneTemplateSection('bpe').subfields.map((subfield) => ({
        ...subfield,
        key: `child${subfield.key.charAt(0).toUpperCase()}${subfield.key.slice(1)}`
      })),
      {
        label: 'Periodontal assessment',
        key: 'childPeriodontalAssessment',
        type: 'checkbox',
        hasNotes: true,
        options: ['Healthy gingival appearance', 'Evidence of inflammation/gingivitis', 'Gross plaque deposits', 'Gross calculus deposits']
      },
      {
        label: 'Caries',
        key: 'childCaries',
        type: 'text'
      },
      {
        label: 'Incisal relationship',
        key: 'childIncisalRelationship',
        type: 'checkbox',
        options: ['Class I', 'Class II div I', 'Class II div II', 'Class III', 'Pt too early in development to assess']
      },
      {
        label: 'NCTSL',
        key: 'childNctsl',
        type: 'checkbox',
        hasNotes: true,
        options: ['No/minimal evidence of TSL', 'Moderate TSL', 'Severe TSL']
      }
    ]
  },
  {
    label: 'Orthodontic Assessment',
    key: 'childOrthodonticAssessment',
    options: [
      'Pt too early in development to assess',
      'No orthodontic concerns',
      'Mild crowding',
      'Moderate/severe crowding',
      'Spacing',
      'Increased overjet',
      'Increased overbite/deep bite',
      'Anterior open bite',
      'Crossbite',
      'Midline discrepancy',
      'Ectopic/unerupted teeth',
      'Impacted teeth suspected',
      'Significant skeletal discrepancy',
      'Oral habit contributing (thumb sucking etc.)',
      'Monitor growth/development',
      'Orthodontic referral indicated'
    ]
  },
  {
    label: 'Radiographs',
    key: 'childRadiographs',
    hasNotes: false,
    options: [
      "None taken due to pt's age/cooperation",
      'BWs taken using sponge, on size 0 film - see items for reports',
      'BWs taken using film holder on size 2 film - see items for reports',
      'OPG taken - see item for report'
    ]
  },
  {
    label: 'Diagnoses',
    key: 'childDiagnoses',
    subfields: [
      {
        label: 'Periodontal',
        key: 'childDiagnosisPeriodontal',
        type: 'checkbox',
        options: ['Clinical gingival health', 'Gingivitis', 'Evidence of periodontal disease']
      },
      {
        label: 'Caries',
        key: 'childDiagnosisCaries',
        type: 'text'
      },
      {
        label: 'NCTSL',
        key: 'childDiagnosisNctsl',
        type: 'checkbox',
        options: ['Nil/mild', 'Moderate', 'Severe']
      }
    ]
  },
  {
    label: 'Risk factors',
    key: 'childRiskFactors',
    subfields: [
      {
        label: 'Periodontal disease',
        key: 'childRiskPeriodontalDisease',
        type: 'checkbox',
        options: ['High', 'Moderate', 'Low']
      },
      {
        label: 'Caries',
        key: 'childRiskCaries',
        type: 'checkbox',
        options: ['High', 'Moderate', 'Low']
      },
      {
        label: 'NCTSL',
        key: 'childRiskNctsl',
        type: 'checkbox',
        options: ['High', 'Moderate', 'Low']
      },
      {
        label: 'Oral cancer',
        key: 'childRiskOralCancer',
        type: 'checkbox',
        options: ['High', 'Moderate', 'Low']
      }
    ]
  },
  {
    ...cloneTemplateSection('discussions'),
    options: [
      'Caries into enamel - permanent',
      'Caries into dentine - permanent',
      'Caries close to/into pulp - permanent',
      'Orthodontic concerns',
      'High caries risk'
    ],
    conditionalText: {
      'Caries into enamel - permanent': cloneTemplateSection('discussions').conditionalText['Caries into enamel'],
      'Caries into dentine - permanent': cloneTemplateSection('discussions').conditionalText['Caries into dentine'],
      'Caries close to/into pulp - permanent': cloneTemplateSection('discussions').conditionalText['Caries close to/into pulp'],
      'Orthodontic concerns': 'Orthodontic assessment discussed with patient/parent. Explained that developing dentition and associated issues as discussed may benefit from orthodontic treatment in the future. Advised ongoing monitoring of dental development and offered referral to MBC for orthodontic assessment and opinion. Advised that treatment here at the practice likely to be in the region of £5k. Patient may be suitable for NHS referral, however not guaranteed to be accepted for treatment due to acceptance criteria.',
      'High caries risk': cloneTemplateSection('discussions').conditionalText['High caries risk']
    }
  },
  cloneTemplateSection('recalls')
];

templates['composite-restoration'] = [
  { label: 'Tooth', key: 'restorationTooth', type: 'text' },
  {
    label: 'Reason for treatment:',
    key: 'restorationReason',
    hasNotes: false,
    options: [
      'Caries',
      'Secondary caries under existing restoration',
      'Lost restoration',
      'Toothwear',
      'Fractured existing restoration',
      'Replacement restoration due to poor margins',
      'Fractured tooth/cusp',
      'Non-carious cervical lesion',
      'Aesthetic improvement'
    ]
  },
  {
    label: 'Pre-op symptoms',
    key: 'preopSymptoms',
    hasNotes: false,
    options: [
      'Yes',
      'No',
      'Sensitivity to cold',
      'Sensitivity to hot/cold',
      'Pain on biting'
    ]
  },
  {
    label: 'Risks of procedure explained:',
    key: 'restorationRisksExplained',
    hasNotes: false,
    options: ['Yes', 'No'],
    conditionalText: {
      'Yes': 'Pulpal exposure and requirement for further treatment including RCT or XLA; requirement for soft tissue management/margin elevation; inability to restore tooth; immediate post op pain and/or sensitivity; requirement for eventual cuspal coverage; failure of restoration via debond, secondary caries, pulpal necrosis.'
    }
  },
  {
    label: 'Verbal consent gained:',
    key: 'restorationVerbalConsent',
    hasNotes: false,
    options: ['Yes', 'No']
  },
  {
    label: 'Local anaesthetic given as infiltrations of lidocaine 2%, 1 in 80,000 epinephrine',
    key: 'lidocaineInfiltration',
    hasNotes: false,
    options: ['1x', '2x', '3x', '4x', '5x', '6x', '2.2ml cartridges']
  },
  {
    label: 'Local anaesthetic given as infiltrations of articaine 4%, 1 in 100,000 epinephrine',
    key: 'articaineInfiltration',
    hasNotes: false,
    options: ['1x', '2x', '3x', '4x', '5x', '6x', '2.2ml cartridges']
  },
  {
    label: 'Rubber dam applied:',
    key: 'rubberDamApplied',
    hasNotes: false,
    options: ['Yes', 'No'],
    conditionalText: {
      'Yes': 'Rubber dam applied, secured with clamp.'
    }
  },
  {
    label: 'Caries management',
    key: 'cariesManagement',
    hasNotes: false,
    options: [
      'Existing restoration removal, full caries management',
      'Existing restoration removal, partial caries removal',
      'Full caries management',
      'Partial/deep caries management'
    ],
    conditionalText: {
      'Existing restoration removal, full caries management': 'Existing restoration and caries removed using high and slow speed handpieces. Peripheral seal/EDJ confirmed as being caries free',
      'Existing restoration removal, partial caries removal': 'Existing restoration removed, selective caries management with some deep caries left in base of cavity due to risk of pulpal exposure. Peripheral seal/EDJ confirmed as being caries free',
      'Full caries management': 'Complete caries management, firm hard dentine in all aspects of cavity.',
      'Partial/deep caries management': 'Selective caries management with some deep caries left in base of cavity due to risk of pulpal exposure. Peripheral seal/EDJ confirmed as being caries free'
    }
  },
  {
    label: 'Matrix system:',
    key: 'matrixSystem',
    hasNotes: false,
    options: ['Sectional, wedge', 'Circumferential, wedge']
  },
  {
    key: 'restorationBondingAutotext',
    type: 'autotext',
    text: `Cavity etched using 37.5% orthophosphoric acid, rinsed.
Prime and bond scrubbed into cavity surfaces, lightly air dried before curing.
Incremental fill with flowable composite resin and compacted composite resin. Modelling with GC liquid. Cured`
  },
  { label: 'Shade:', key: 'restorationShade', type: 'text' },
  {
    key: 'restorationCompletionAutotext',
    type: 'autotext',
    text: `Occlusion checked with articulating paper and shimstock hold on previously established occlusal contact. Adjusted to conform with pre-operative occlusion. Contacts flossed.

POIG regards LA, post-op tenderness and sensitivity. Agreed to review/adjust as per pt request if required.

Patient left surgery happy.`
  }
];

templates['extraction'] = [
  {
    label: 'Tooth',
    key: 'extractionTooth',
    subfields: [
      {
        label: 'Tooth',
        key: 'extractionToothText',
        type: 'text'
      },
      {
        label: 'Tooth section',
        key: 'extractionToothRegion',
        type: 'checkbox',
        options: [
          'Upper anterior tooth',
          'Upper posterior tooth',
          'Lower anterior tooth',
          'Lower posterior tooth'
        ],
        conditionalText: {
          'Upper posterior tooth': 'Patient advised of the risk of oro-antral communication/oro-antral fistula (OAC/OAF) associated with extraction of upper posterior teeth due to proximity of the maxillary sinus. Explained possible consequences including sinus involvement, fluid passage between mouth and nose, infection, and the potential need for further surgical management if persistent.',
          'Lower posterior tooth': 'Due to the proximity of the inferior alveolar and lingual nerves, there is a risk of temporary or, rarely, permanent numbness, tingling, or altered sensation affecting the lower lip, chin, tongue, or gums'
        }
      }
    ]
  },
  {
    label: 'Justification for extraction:',
    key: 'extractionJustification',
    hasNotes: false,
    options: [
      'Unrestorable tooth',
      'Irreversible pulpitis symptoms, pt declines RCT',
      'Dental abscess/infection, pt declines RCT',
      'Advanced periodontal disease, tooth of hopeless prognosis/severe mobility',
      'Fractured tooth',
      'Orthodontic reasons'
    ]
  },
  {
    label: 'Medical history relevant to extraction',
    key: 'extractionMedical',
    hasNotes: false,
    options: [
      'Pt reports no relevant medical history',
      'Significant cardiac event within the last 6m',
      'Pt taking blood thinning medication',
      'Poorly controlled diabetes',
      'Pt taking immunosuppressant medication',
      'Pt taking IV bisphosphonates',
      'Pt taking polypharmacy',
      'Liver disease',
      'Kidney disease'
    ]
  },
  {
    label: 'Consent obtained:',
    key: 'extractionConsent',
    type: 'radios',
    hasNotes: false,
    options: ['Verbal', 'Written and verbal'],
    conditionalText: {
      'Verbal': 'Risks associated with tooth extraction explained to patient as being; pain, swelling, bruising, bleeding, infection, delayed healing, or dry socket (where the blood clot is lost from the extraction site). There is also a small risk of damage to nearby teeth, fillings, nerves, or surrounding tissues, which may occasionally cause temporary or, rarely, permanent numbness or altered sensation. In some cases, fragments of tooth or root may remain, or further treatment may be required if healing is not straightforward.',
      'Written and verbal': 'Risks associated with tooth extraction explained to patient as being; pain, swelling, bruising, bleeding, infection, delayed healing, or dry socket (where the blood clot is lost from the extraction site). There is also a small risk of damage to nearby teeth, fillings, nerves, or surrounding tissues, which may occasionally cause temporary or, rarely, permanent numbness or altered sensation. In some cases, fragments of tooth or root may remain, or further treatment may be required if healing is not straightforward.'
    }
  },
  {
    label: 'Local anaesthetic given as infiltrations of lidocaine 2%, 1 in 80,000 epinephrine',
    key: 'extractionLidocaineInfiltration',
    hasNotes: false,
    options: ['1x', '2x', '3x', '4x', '5x', '6x', '2.2ml cartridges']
  },
  {
    label: 'Local anaesthetic given as infiltrations of articaine 4%, 1 in 100,000 epinephrine',
    key: 'extractionArticaineInfiltration',
    hasNotes: false,
    options: ['1x', '2x', '3x', '4x', '5x', '6x', '2.2ml cartridges']
  },
  {
    key: 'extractionAnaesthesiaConfirmed',
    type: 'autotext',
    text: 'Confirmed anaesthesia of area using sharp probe prior to commencing extraction.'
  },
  {
    label: 'Extraction carried out using:',
    key: 'extractionInstruments',
    hasNotes: false,
    options: ['Luxators', 'Elevators', 'Periotomes']
  },
  {
    label: 'Tooth sectioned:',
    key: 'toothSectioned',
    hasNotes: false,
    options: ['Yes'],
    conditionalText: {
      'Yes': 'Tooth sectioned using surgical handpiece and burs. Roots delivered individually'
    }
  },
  {
    label: 'Difficulty of extraction:',
    key: 'extractionDifficulty',
    hasNotes: true,
    options: [
      'Simple extraction, no complications. Apices intact, haemostasis achieved in chair.',
      'Difficult extraction, some bone removed to faciltate extraction. All fragments removed as far as could be seen at time of procedure.'
    ]
  },
  {
    label: 'Haemostasis:',
    key: 'extractionHaemostasis',
    hasNotes: true,
    options: [
      'Haemostasis achieved with damp gauze and pressure.',
      'Haemostasis achieved with damp gauze, pressure and placement of haemostatic dressing (Gelatamp)',
      'Haemostasis achieved with gamp gauze, pressure and placement of haemostatic dressing (Surgicel)',
      'Haemostasis achieved with damp gauze, pressure, placement of haemostatic dressing, site sutured.'
    ]
  },
  { key: 'postOpInstructions', type: 'autotext', text: 'Post-operative instructions provided.' },
  { label: 'Discussions', key: 'discussions', hasNotes: true }
];

templates['emergency'] = [
  { label: 'Presenting complaint', key: 'emergencyComplaint', hasNotes: true },
  { label: 'Pain details', key: 'emergencyPain', subfields: [{ label: 'Severity', key: 'emergencyPainSeverity', type: 'checkbox', options: ['1','2','3','4','5','6','7','8','9','10'] }] },
  { label: 'Swelling', key: 'emergencySwelling', options: ['None','Localised','Diffused'] },
  { label: 'Infection', key: 'emergencyInfection', options: ['Yes','No'] },
  { label: 'Analgesia/Antibiotics', key: 'emergencyMeds', hasNotes: true },
  { label: 'Discussions', key: 'discussions', hasNotes: true },
  { label: 'Risk Assessment', key: 'riskAssessment', subfields: [ { label: 'Overall risk', key: 'riskOverallEmergency', type: 'checkbox', options: ['Low','Moderate','High'] } ] }
];

function createBwReportSection(label, keyPrefix) {
  return {
    label,
    key: `${keyPrefix}Report`,
    subfields: [
      {
        label: 'Justification',
        key: `${keyPrefix}Justification`,
        type: 'static',
        text: 'Justification: Interproximal caries detection, bone level assessment'
      },
      {
        label: 'Grade',
        key: `${keyPrefix}Grade`,
        type: 'radios',
        options: ['A', 'N']
      },
      {
        label: 'Reason for N grade',
        key: `${keyPrefix}GradeReason`,
        type: 'text',
        dependsOn: { key: `${keyPrefix}Grade`, value: 'N' }
      },
      {
        label: 'Caries',
        key: `${keyPrefix}Caries`,
        type: 'text'
      },
      {
        label: 'Bone levels',
        key: `${keyPrefix}BoneLevels`,
        type: 'radios',
        options: ['WNL', 'horizontal bone loss', 'vertical bone loss']
      }
    ]
  };
}

function createPaReportSection(label, keyPrefix) {
  return {
    label,
    key: `${keyPrefix}Report`,
    subfields: [
      {
        label: 'Justification',
        key: `${keyPrefix}Justification`,
        type: 'checkbox',
        options: [
          'Assessment of bone levels',
          'Periapical pathology',
          'Pre-treatment assessment',
          'Pre-extraction assessment'
        ]
      },
      {
        label: 'Grade',
        key: `${keyPrefix}Grade`,
        type: 'radios',
        options: ['A', 'N']
      },
      {
        label: 'Reason for N grade',
        key: `${keyPrefix}GradeReason`,
        type: 'text',
        dependsOn: { key: `${keyPrefix}Grade`, value: 'N' }
      },
      {
        label: 'Caries',
        key: `${keyPrefix}Caries`,
        type: 'text'
      },
      {
        label: 'Periapical pathology',
        key: `${keyPrefix}PeriapicalPathology`,
        type: 'text'
      },
      {
        label: 'Bone levels',
        key: `${keyPrefix}BoneLevels`,
        type: 'radios',
        options: ['WNL', 'horizontal bone loss', 'vertical bone loss']
      }
    ]
  };
}

templates['bw-pa-radiographs'] = [
  createBwReportSection('Left BW', 'leftBw'),
  createBwReportSection('Right BW', 'rightBw'),
  createPaReportSection('URQ PA', 'urqPa'),
  createPaReportSection('Upper anterior PA', 'upperAnteriorPa'),
  createPaReportSection('ULQ PA', 'ulqPa'),
  createPaReportSection('LLQ PA', 'llqPa'),
  createPaReportSection('Lower anterior PA', 'lowerAnteriorPa'),
  createPaReportSection('LRQ PA', 'lrqPa')
];

templates['opg-radiograph'] = [
  { label: 'Radiograph report:', key: 'opgRadiographReport', type: 'text' }
];

function createDentureTemplate(keyPrefix) {
  return [
    { label: 'Notes:', key: `${keyPrefix}Notes`, type: 'text' },
    { label: 'Discussions', key: 'discussions', hasNotes: true }
  ];
}

templates['primary-denture-impressions'] = createDentureTemplate('primaryDentureImpressions');
templates['secondary-denture-impressions'] = createDentureTemplate('secondaryDentureImpressions');
templates['bite-registration'] = createDentureTemplate('biteRegistration');
templates['denture-try-in'] = createDentureTemplate('dentureTryIn');
templates['denture-fit'] = createDentureTemplate('dentureFit');

function createNurseSection() {
  return {
    label: 'Nurse:',
    key: 'nurse',
    hasNotes: false,
    options: [
      'Alice',
      'Layla',
      'Ellie',
      'Sophie',
      'Ruby',
      'Tia',
      'Megan',
      'Tania',
      'Abbie',
      'Bex',
      'Bex W',
      'Gabby',
      'Olivia'
    ]
  };
}

const templatesWithoutNurse = new Set(['bw-pa-radiographs', 'opg-radiograph']);

Object.entries(templates).forEach(([key, template]) => {
  if (templatesWithoutNurse.has(key)) return;
  if (!template.some((section) => section.key === 'nurse')) {
    template.unshift(createNurseSection());
  }
});

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedNotes }));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed.savedNotes)) {
      savedNotes = parsed.savedNotes;
    }
  } catch (error) {
    console.warn('Unable to load saved state', error);
  }
}

function renderTemplate(templateKey = currentTemplate) {
  currentTemplate = templateKey;
  const template = templates[currentTemplate] || templates['new-assessment'];
  if (headerTitle) headerTitle.textContent = (templateTitles[currentTemplate] || titleize(currentTemplate));
  formArea.innerHTML = '';

  // Helper to toggle conditional blocks (for fields that depend on other options)
  function toggleConditionalBlocks() {
    template.forEach((it) => {
      if (it.dependsOn) {
        const block = document.getElementById(`${it.key}-field`);
        if (!block) return;
        const depChecked = Array.from(document.querySelectorAll(`input[name="${it.dependsOn.key}"]:checked`)).some((i) => i.value === it.dependsOn.value);
        block.style.display = depChecked ? 'block' : 'none';
      }
    });

    document.querySelectorAll('.subfield-block[data-depends-on]').forEach((block) => {
      const depName = block.dataset.dependsOn;
      const depValue = block.dataset.dependsValue;
      const depChecked = Array.from(document.querySelectorAll(`input[name="${depName}"]:checked`)).some((i) => i.value === depValue);
      block.style.display = depChecked ? 'block' : 'none';
    });
  }

  template.forEach((item) => {
    if (item.type === 'autotext') return;

    const field = document.createElement('div');
    field.className = 'form-field';
    if (item.dependsOn) {
      field.id = `${item.key}-field`;
      field.style.display = 'none';
    }
    if (item.key === 'bpe') {
      field.classList.add('bpe-field');
    }

    const label = document.createElement('div');
    label.className = 'field-heading';
    label.textContent = item.label;

    field.appendChild(label);

    // If this item has subfields, render them inside a container
    if (Array.isArray(item.subfields)) {
      const conditionalBlock = document.createElement('div');
      conditionalBlock.id = `${item.key}-conditional`;
      conditionalBlock.className = 'conditional-block';
      conditionalBlock.style.display = 'block';

      item.subfields.forEach((sf) => {
        const sfWrapper = document.createElement('div');
        sfWrapper.id = `${sf.key}-conditional`;
        sfWrapper.className = 'subfield-block';
        if (sf.dependsOn) {
          sfWrapper.style.display = 'none';
          sfWrapper.dataset.dependsOn = sf.dependsOn.key;
          sfWrapper.dataset.dependsValue = sf.dependsOn.value;
        }

        const sfLabel = document.createElement('div');
        sfLabel.className = 'field-heading';
        sfLabel.textContent = sf.label;
        sfWrapper.appendChild(sfLabel);

        if (sf.type === 'checkbox') {
          const grp = document.createElement('div');
          grp.className = 'checkbox-group';
          sf.options.forEach((opt, idx) => {
            const id = `${sf.key}-${idx}`;
            const lab = document.createElement('label');
            lab.className = 'checkbox-item';
            lab.htmlFor = id;

            const inp = document.createElement('input');
            inp.type = 'checkbox';
            inp.id = id;
            inp.name = sf.key;
            inp.value = opt;
            inp.addEventListener('change', buildNote);

            const sp = document.createElement('span');
            sp.textContent = opt;

            lab.appendChild(inp);
            lab.appendChild(sp);
            grp.appendChild(lab);
          });
          sfWrapper.appendChild(grp);
        } else if (sf.type === 'select') {
          const sel = document.createElement('select');
          sel.name = sf.key;
          sf.options.forEach((opt) => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            sel.appendChild(option);
          });
          sel.addEventListener('change', buildNote);
          sfWrapper.appendChild(sel);
        } else if (sf.type === 'bpe') {
          const container = document.createElement('div');
          container.className = 'bpe-control';

          const grp = document.createElement('div');
          grp.className = 'checkbox-group bpe-group';
          sf.options.forEach((opt, idx) => {
            const id = `${sf.key}-${idx}`;
            const lab = document.createElement('label');
            lab.className = 'checkbox-item';
            lab.htmlFor = id;

            const inp = document.createElement('input');
            inp.type = 'radio';
            inp.id = id;
            inp.name = sf.key;
            inp.value = opt;
            inp.addEventListener('change', buildNote);

            const sp = document.createElement('span');
            sp.textContent = opt;

            lab.appendChild(inp);
            lab.appendChild(sp);
            grp.appendChild(lab);
          });
          container.appendChild(grp);

          const starLabel = document.createElement('label');
          starLabel.className = 'checkbox-item bpe-star-item';
          starLabel.htmlFor = `${sf.key}-star`;

          const starInput = document.createElement('input');
          starInput.type = 'checkbox';
          starInput.id = `${sf.key}-star`;
          starInput.name = `${sf.key}-star`;
          starInput.value = '*';
          starInput.addEventListener('change', buildNote);

          const starSpan = document.createElement('span');
          starSpan.textContent = '*';

          starLabel.appendChild(starInput);
          starLabel.appendChild(starSpan);
          container.appendChild(starLabel);

          sfWrapper.appendChild(container);
        } else if (sf.type === 'text') {
          const textarea = document.createElement('textarea');
          textarea.name = sf.key;
          textarea.className = 'section-notes';
          textarea.placeholder = sf.label;
          textarea.addEventListener('input', buildNote);
          sfWrapper.appendChild(textarea);
        } else if (sf.type === 'radio') {
          const input = document.createElement('input');
          input.type = 'text';
          input.name = sf.key;
          input.className = 'section-notes';
          input.placeholder = sf.label;
          input.addEventListener('input', buildNote);
          sfWrapper.appendChild(input);
        } else if (sf.type === 'radios') {
          const grp = document.createElement('div');
          grp.className = 'checkbox-group';
          sf.options.forEach((opt, idx) => {
            const id = `${sf.key}-${idx}`;
            const lab = document.createElement('label');
            lab.className = 'checkbox-item';
            lab.htmlFor = id;

            const inp = document.createElement('input');
            inp.type = 'radio';
            inp.id = id;
            inp.name = sf.key;
            inp.value = opt;
            inp.addEventListener('change', buildNote);

            const sp = document.createElement('span');
            sp.textContent = opt;

            lab.appendChild(inp);
            lab.appendChild(sp);
            grp.appendChild(lab);
          });
          sfWrapper.appendChild(grp);
        }

        if (sf.hasNotes && sf.type !== 'text') {
          const sfNotesLabel = document.createElement('div');
          sfNotesLabel.className = 'field-heading';
          sfNotesLabel.textContent = 'Add detail / expand:';

          const sfNotesTextarea = document.createElement('textarea');
          sfNotesTextarea.className = 'section-notes';
          sfNotesTextarea.id = `${sf.key}-notes`;
          sfNotesTextarea.placeholder = `Add extra details for ${sf.label.toLowerCase()}...`;
          sfNotesTextarea.addEventListener('input', buildNote);

          sfWrapper.appendChild(sfNotesLabel);
          sfWrapper.appendChild(sfNotesTextarea);
        }

        conditionalBlock.appendChild(sfWrapper);

        // If this subfield depends on another field, wire up toggling
        if (sf.dependsOn) {
          const depName = sf.dependsOn.key;
          const depValue = sf.dependsOn.value;
          const toggle = () => {
            const depChecked = Array.from(document.querySelectorAll(`input[name="${depName}"]:checked`)).some((i) => i.value === depValue);
            sfWrapper.style.display = depChecked ? 'block' : 'none';
          };
          // Attach listeners to dependency inputs (checkbox/radio/select)
          document.querySelectorAll(`input[name="${sf.dependsOn.key}"]`).forEach((el) => el.addEventListener('change', toggle));
          const sel = document.querySelector(`select[name="${sf.dependsOn.key}"]`);
          if (sel) sel.addEventListener('change', toggle);
          // initial state
          toggle();
        }
      });

      field.appendChild(conditionalBlock);
      if (item.hasNotes) {
        const notesLabel = document.createElement('div');
        notesLabel.className = 'field-heading';
        notesLabel.textContent = 'Add detail / expand:';

        const notesTextarea = document.createElement('textarea');
        notesTextarea.className = 'section-notes';
        notesTextarea.id = `${item.key}-notes`;
        notesTextarea.placeholder = `Add extra details for ${item.label.toLowerCase()}...`;
        notesTextarea.addEventListener('input', buildNote);

        field.appendChild(notesLabel);
        field.appendChild(notesTextarea);
      }
      formArea.appendChild(field);
      return; // done with this item
    }

    if (item.type === 'text') {
      const textarea = document.createElement('textarea');
      textarea.name = item.key;
      textarea.className = 'section-notes';
      textarea.placeholder = item.label.replace(/:$/, '');
      textarea.addEventListener('input', buildNote);

      field.appendChild(textarea);
      formArea.appendChild(field);
      return;
    }

    // Regular options (checkbox list)
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'checkbox-group';

    if (Array.isArray(item.options)) {
      item.options.forEach((optionText, index) => {
        const optionId = `${item.key}-${index}`;
        const optionLabel = document.createElement('label');
        optionLabel.className = 'checkbox-item';
        optionLabel.htmlFor = optionId;

        const input = document.createElement('input');
        input.type = item.type === 'radios' ? 'radio' : 'checkbox';
        input.id = optionId;
        input.name = item.key;
        input.value = optionText;
        input.addEventListener('change', () => {
          buildNote();
          toggleConditionalBlocks();
        });

        const span = document.createElement('span');
        span.textContent = optionText;

        optionLabel.appendChild(input);
        optionLabel.appendChild(span);
        checkboxGroup.appendChild(optionLabel);
      });
    }

    const notesLabel = document.createElement('div');
    notesLabel.className = 'field-heading';
    notesLabel.textContent = 'Add detail / expand:';

    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'section-notes';
    notesTextarea.id = `${item.key}-notes`;
    notesTextarea.placeholder = `Add extra details for ${item.label.toLowerCase()}...`;
    notesTextarea.addEventListener('input', buildNote);

    if (Array.isArray(item.options)) {
      field.appendChild(checkboxGroup);
    }

    // Only add notes section if hasNotes is not false
    if (item.hasNotes !== false) {
      field.appendChild(notesLabel);
      field.appendChild(notesTextarea);
    }

    formArea.appendChild(field);
  });

  // Initial toggle based on current selections
  (function initToggle() {
    template.forEach((it) => {
      if (it.dependsOn) {
        const block = document.getElementById(`${it.key}-field`);
        if (!block) return;
        block.style.display = 'none';
      }
    });
    toggleConditionalBlocks();
    // Attach a global change listener to update conditional blocks if any checkbox changes
    document.querySelectorAll('input[type=checkbox]').forEach((i) => i.addEventListener('change', () => {
      toggleConditionalBlocks();
    }));
  })();
}

function buildNote() {
  const template = templates[currentTemplate] || templates['new-assessment'];
  const lines = [];
  lines.push(templateTitles[currentTemplate] || titleize(currentTemplate));
  lines.push('');

  function getCompactBpeLine(subfields, keyOrder, label = 'BPE') {
    const values = {};
    subfields.forEach((sf) => {
      if (sf.type !== 'bpe') return;
      const checkedRadio = document.querySelector(`input[name="${sf.key}"]:checked`);
      const starBox = document.querySelector(`input[name="${sf.key}-star"]`);
      if (checkedRadio) {
        values[sf.key] = checkedRadio.value + ((starBox && starBox.checked) ? '*' : '');
      }
    });

    if (Object.keys(values).length === 0) return '';

    const firstHalf = keyOrder.slice(0, 3).map((key) => values[key] || '').join(' ');
    const secondHalf = keyOrder.slice(3).map((key) => values[key] || '').join(' ');
    return `${label}: ${firstHalf} / ${secondHalf}`;
  }

  const discussionAutotext = [];
  if (document.querySelector('input[name="smoking"][value="Current smoker"]:checked')) {
    discussionAutotext.push('Smoking status discussed. Advised patient that smoking increases risk of cardiovascular disease, stroke, COPD, multiple cancers, poor wound healing, and reduced overall life expectancy. Discussed benefits of smoking cessation including improved respiratory and cardiovascular health, reduced cancer risk, improved circulation and energy levels, and financial savings. Offered smoking cessation support and signposted to local/appropriate cessation services.');
  }
  if (document.querySelector('input[name="alcohol"][value="Consumes alcohol in excess of NHS recommended weekly limit of 14 units per week"]:checked')) {
    discussionAutotext.push('Alcohol intake discussed. Patient advised that excess alcohol consumption increases risk of multiple diseases/conditions and is associated with increased oral cancer risk. Discussed recommended alcohol limits (≤14 units/week), benefits of reduction/cessation including improved health.');
  }

  template.forEach((item) => {
    if (item.type === 'autotext') {
      if (item.text) {
        lines.push(item.text);
        lines.push('');
      }
      return;
    }

    // If this item has subfields, include them when appropriate
    if (item.key === 'diagnoses') {
      lines.push('Radiographs taken for diagnostic and treatment planning purposes, see items for individual reports. Clinical photographs also taken for assessment, monitoring and patient communication purposes.');
      lines.push('');
    }
    if (Array.isArray(item.subfields)) {
      if (item.dependsOn) {
        const depChecked = Array.from(document.querySelectorAll(`input[name="${item.dependsOn.key}"]:checked`)).some((i) => i.value === item.dependsOn.value);
        if (!depChecked) return;
      }

      // Add heading for the block only if any subfield has value
      let blockLines = [];
      item.subfields.forEach((sf) => {
        if (sf.dependsOn) {
          const depChecked = Array.from(document.querySelectorAll(`input[name="${sf.dependsOn.key}"]:checked`)).some((i) => i.value === sf.dependsOn.value);
          if (!depChecked) return; // skip this subfield when its dependency isn't satisfied
        }

        if (sf.type === 'checkbox') {
          const vals = Array.from(document.querySelectorAll(`input[name="${sf.key}"]:checked`)).map((i) => i.value);
          if (vals.length) {
            blockLines.push(item.key === 'periodontalAssessment' ? vals.join(', ') : `${sf.label}: ${vals.join(', ')}`);
            if (sf.conditionalText && item.key !== 'diagnoses') {
              vals.forEach((value) => {
                if (sf.conditionalText[value]) {
                  blockLines.push(`  ${sf.conditionalText[value]}`);
                }
              });
            }
          }
        } else if (sf.type === 'select') {
          const sel = document.querySelector(`select[name="${sf.key}"]`);
          if (sel && sel.value) {
            blockLines.push(`${sf.label}: ${sel.value}`);
            if (sf.conditionalText && item.key !== 'diagnoses' && sf.conditionalText[sel.value]) {
              blockLines.push(`  ${sf.conditionalText[sel.value]}`);
            }
          }
        } else if (sf.type === 'static') {
          // static text to show at top of a section
          if (sf.text) {
            blockLines.push(sf.text);
          }
        } else if (sf.type === 'bpe') {
          if (item.key === 'childIntraoralExamination') return;
          const checkedRadio = document.querySelector(`input[name="${sf.key}"]:checked`);
          const starBox = document.querySelector(`input[name="${sf.key}-star"]`);
          if (checkedRadio) {
            const value = checkedRadio.value + ((starBox && starBox.checked) ? '*' : '');
            blockLines.push(`${sf.label}: ${value}`);
          }
        } else if (sf.type === 'radios') {
          const checkedRadio = document.querySelector(`input[name="${sf.key}"]:checked`);
          if (checkedRadio) {
            blockLines.push(`${sf.label}: ${checkedRadio.value}`);
          }
        } else if (sf.type === 'radio') {
          const checkedRadio = document.querySelector(`input[name="${sf.key}"]:checked`);
          if (checkedRadio) {
            blockLines.push(`${sf.label}: ${checkedRadio.value}`);
          }
        } else {
          const inp = document.querySelector(`input[name="${sf.key}"], textarea[name="${sf.key}"]`);
          if (inp && inp.value.trim()) {
            blockLines.push(`${sf.label}: ${inp.value.trim()}`);
          }
        }

        const sfNoteValue = document.getElementById(`${sf.key}-notes`)?.value.trim();
        if (sf.hasNotes && sfNoteValue) {
          blockLines.push(`  Notes: ${sfNoteValue}`);
        }
      });

      const sectionNoteValue = item.hasNotes ? document.getElementById(`${item.key}-notes`)?.value.trim() : '';
      if (sectionNoteValue) {
        blockLines.push(`Notes: ${sectionNoteValue}`);
      }

      if (item.key === 'childIntraoralExamination') {
        const childBpeOrder = [
          'childBpeUrq',
          'childBpeUpperAnteriors',
          'childBpeUlq',
          'childBpeLrq',
          'childBpeLowerAnteriors',
          'childBpeLlq'
        ];
        const childBpeLine = getCompactBpeLine(item.subfields, childBpeOrder);
        if (childBpeLine) {
          blockLines = blockLines.filter((line) => line !== 'BPE');
          blockLines.push(childBpeLine);
        }
      }

      if (blockLines.length) {
        if (item.key === 'bpe') {
          const bpeOrder = ['bpeUrq', 'bpeUpperAnteriors', 'bpeUlq', 'bpeLrq', 'bpeLowerAnteriors', 'bpeLlq'];
          lines.push(getCompactBpeLine(item.subfields, bpeOrder, item.label));
          lines.push('');
          return;
        }
        lines.push(`${item.label}:`);
        blockLines.forEach((l) => lines.push(l));
        lines.push('');
      }

      return;
    }

    // Regular items
    const checked = Array.from(document.querySelectorAll(`input[name="${item.key}"]:checked`)).map((input) => input.value);
    const textValue = item.type === 'text' ? document.querySelector(`textarea[name="${item.key}"]`)?.value.trim() : '';
    const notesValue = textValue || document.getElementById(`${item.key}-notes`)?.value.trim();
    const outputLabel = item.label.replace(/:$/, '');

    if (item.key === 'discussions') {
      const discussionTexts = checked
        .map((value) => item.conditionalText?.[value])
        .filter(Boolean)
        .concat(discussionAutotext);

      if (discussionTexts.length === 0 && !notesValue) return;

      lines.push(`${outputLabel}:`);
      discussionTexts.forEach((text, index) => {
        lines.push(text);
        if (index < discussionTexts.length - 1 || notesValue) {
          lines.push('');
        }
      });
      if (notesValue) {
        lines.push(`Notes: ${notesValue}`);
      }
      lines.push('');
      return;
    }

    if (item.key === 'cariesManagement') {
      const cariesManagementTexts = checked
        .map((value) => item.conditionalText?.[value])
        .filter(Boolean);

      if (cariesManagementTexts.length === 0 && !notesValue) return;

      cariesManagementTexts.forEach((text) => lines.push(text));
      if (notesValue) {
        lines.push(`Notes: ${notesValue}`);
      }
      lines.push('');
      return;
    }

    if (item.key === 'toothSectioned') {
      const toothSectionedTexts = checked
        .map((value) => item.conditionalText?.[value])
        .filter(Boolean);

      if (toothSectionedTexts.length === 0 && !notesValue) return;

      toothSectionedTexts.forEach((text) => lines.push(text));
      if (notesValue) {
        lines.push(notesValue);
      }
      lines.push('');
      return;
    }

    if (['extractionDifficulty', 'extractionHaemostasis'].includes(item.key)) {
      if (checked.length === 0 && !notesValue) return;

      checked.forEach((value) => lines.push(value));
      if (notesValue) {
        lines.push(notesValue);
      }
      lines.push('');
      return;
    }

    if (checked.length === 0 && !notesValue) return;

    if (checked.length > 0) {
      if (item.key === 'discussions') {
        lines.push(`${outputLabel}:`);
      } else {
        lines.push(`${outputLabel}: ${checked.join(', ')}`);
      }

      checked.forEach((value, index) => {
        if (item.conditionalText && item.conditionalText[value]) {
          lines.push(item.key === 'discussions' ? item.conditionalText[value] : `  ${item.conditionalText[value]}`);
          if (item.key === 'discussions' && index < checked.length - 1) {
            lines.push('');
          }
        }
      });
    } else {
      lines.push(`${outputLabel}: ${notesValue}`);
    }

    if (notesValue && checked.length > 0) {
      lines.push(`Notes: ${notesValue}`);
    }

    lines.push('');
  });

  noteText.value = lines.join('\n').trim();
}

function renderSavedNotes() {
  savedList.innerHTML = '';
  if (savedNotes.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No saved notes yet.';
    savedList.appendChild(empty);
    return;
  }

  savedNotes.slice().reverse().forEach((note) => {
    const li = document.createElement('li');
    const sample = document.createElement('span');
    sample.textContent = `${new Date(note.createdAt).toLocaleString()}`;

    const loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => {
      noteText.value = note.text;
    });

    li.appendChild(sample);
    li.appendChild(loadButton);
    savedList.appendChild(li);
  });
}

function saveNote() {
  const text = noteText.value.trim();
  if (!text) {
    alert('Generate a note before saving.');
    return;
  }

  const note = {
    type: templateTitles[currentTemplate] || titleize(currentTemplate),
    text,
    createdAt: new Date().toISOString()
  };

  savedNotes.push(note);
  saveState();
  renderSavedNotes();
}

function copyNote() {
  if (!noteText.value) return;
  navigator.clipboard.writeText(noteText.value).then(() => {
    alert('Note copied to clipboard.');
  });
}

function clearSavedNotes() {
  if (!confirm('Clear all saved notes?')) return;
  savedNotes = [];
  saveState();
  renderSavedNotes();
}

copyBtn.addEventListener('click', copyNote);
saveBtn.addEventListener('click', saveNote);
clearNotesButton.addEventListener('click', clearSavedNotes);

loadState();
renderSidebar();
renderTemplate();
buildNote();
renderSavedNotes();

window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
});
