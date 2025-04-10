import { DataStreamWriter, tool, Tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { updateChatTemplate } from '@/lib/api';
import { getChatTemplates, saveDocument, getDocumentById, getDocumentsByChatId } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { unparse } from 'papaparse';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/registry';

interface RequestTemplateUpdateProps {
  session: Session;
  dataStream: DataStreamWriter;
  chatId: string;
}

const requestTemplateUpdateSchema = z.object({
  userQuery: z.string().describe('The user query that might trigger a template update'),
});

interface RequestTemplateUpdateResult {
  success: boolean;
  message: string;
  updatedTemplates?: Record<string, any>;
}

interface FieldData {
  value: string | number;
  required: boolean;
  description?: string;
}

interface SubsectionData {
  [key: string]: FieldData;
}

interface SectionData {
  [key: string]: SubsectionData;
}

interface Assumptions {
  [key: string]: SectionData;
}

interface TemplateData {
  assumptions: Assumptions;
}

interface TemplateState {
  user_input: boolean;
  development: boolean;
  revenue: boolean;
  returns: boolean;
  cashflow: boolean;
}

const templateStateByChat = new Map<string, TemplateState>();

export const convertJsonToCsv = (json: any) => {
  if (json?.assumptions || json?.assumptions_template) {
    const template = json.assumptions || json.assumptions_template;
    return {
      csv: convertAssumptionsToCSV(template),
      type: 'assumptions'
    };
  } else if (json?.development || json?.development_template) {
    const template = json.development || json.development_template;
    return {
      csv: convertDevelopmentToCSV(template),
      type: 'development'
    };
  } else if (json?.revenue || json?.revenue_template) {
    const template = json.revenue || json.revenue_template;
    return {
      csv: convertRevenueToCSV(template),
      type: 'revenue'
    };
  } else if (json?.returns || json?.returns_template) {
    const template = json.returns || json.returns_template;
    return {
      csv: convertReturnsToCSV(template),
      type: 'returns'
    };
  } else if (json?.cashflow || json?.cashflow_template) {
    const template = json.cashflow || json.cashflow_template;
    return {
      csv: convertCashflowToCSV(template),
      type: 'cashflow'
    };
  }
  
  return { csv: '', type: null };
};

function convertAssumptionsToCSV(assumptions: any) {
  const rows: Array<[string, string, string, string, string]> = [];
  rows.push(['Section', 'Subsection', 'Field', 'Value', 'Required']);
  
  // Helper function to process nested objects
  const processNestedObject = (
    sectionName: string,
    subsectionName: string,
    fieldName: string,
    data: any
  ) => {
    if (!data || typeof data !== 'object') return;

    // If the object has a value property, add it as a row
    if ('value' in data) {
      rows.push([
        sectionName,
        subsectionName,
        fieldName,
        data.value?.toString() || '',
        data.required?.toString() || 'false'
      ]);
      return;
    }

    // Skip description fields
    if (fieldName === 'description') return;

    // Recursively process nested objects
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      if (key === 'description') return;
      if (typeof value === 'object') {
        processNestedObject(sectionName, fieldName, key, value);
      }
    });
  };
  
  // Process each main section
  Object.entries(assumptions).forEach(([sectionName, sectionData]: [string, any]) => {
    if (!sectionData || typeof sectionData !== 'object') return;
    if (sectionName === 'description') return;

    // Process each field in the section
    Object.entries(sectionData).forEach(([fieldName, fieldData]: [string, any]) => {
      if (!fieldData || typeof fieldData !== 'object') return;
      if (fieldName === 'description') return;

      // If the field has a direct value property
      if ('value' in fieldData) {
        rows.push([
          sectionName,
          '',
          fieldName,
          fieldData.value?.toString() || '',
          fieldData.required?.toString() || 'false'
        ]);
      } else {
        // Process nested objects
        processNestedObject(sectionName, '', fieldName, fieldData);
      }
    });
    
    // Add separator between sections
    rows.push(['', '', '', '', '']);
  });
  
  return unparse(rows);
}

function convertDevelopmentToCSV(template: any) {
  const rows: Array<any> = [];
  
  if (template.columns) {
    rows.push(template.columns.map((col: any) => col.name));
  }
  
  if (template.sections) {
    template.sections.forEach((section: any) => {
      rows.push([]);
      rows.push([section.name, ...Array(template.columns?.length ? template.columns.length - 1 : 0).fill('')]);
      
      if (section.rows) {
        section.rows.forEach((row: any) => {
          let rowData;
          if (Array.isArray(row)) {
            rowData = row;
          } else if (template.columns) {
            rowData = template.columns.map((col: any) => {
              const value = row[col.name];
              return value !== undefined && value !== null ? value.toString() : '';
            });
          } else {
            rowData = Object.values(row).map(value => 
              value !== undefined && value !== null ? value.toString() : ''
            );
          }
          rows.push(rowData);
        });
      }
      
      if (section.totals) {
        if (Array.isArray(section.totals)) {
          rows.push(section.totals);
        } else if (template.columns) {
          const totalsRow = template.columns.map((col: any) => {
            const value = section.totals[col.name];
            return value !== undefined && value !== null ? value.toString() : '';
          });
          rows.push(totalsRow);
        } else {
          rows.push(Object.values(section.totals).map(value => 
            value !== undefined && value !== null ? value.toString() : ''
          ));
        }
      }
    });
  }
  
  if (template.metrics) {
    rows.push([]);
    rows.push(['Metrics']);
    Object.entries(template.metrics).forEach(([key, value]) => {
      rows.push([key, value !== undefined && value !== null ? value.toString() : '']);
    });
  }

  return unparse(rows);
}

function convertRevenueToCSV(template: any) {
  const rows: Array<any> = [];
  
  rows.push(template.columns.map((col: any) => col.name));
  
  template.sections.forEach((section: any) => {
    rows.push([section.name, ...Array(template.columns.length - 1).fill('')]);
    
    if (section.rows) {
      section.rows.forEach((row: any) => {
        const rowData = template.columns.map((col: any) => row[col.name] ?? '');
        rows.push(rowData);
      });
    }
    
    if (section.totals) {
      const totalsRow = template.columns.map((col: any) => section.totals[col.name] ?? '');
      rows.push(totalsRow);
    }
  });
  
  return unparse(rows);
}

function convertReturnsToCSV(template: any): string {
  const rows: Array<any> = [];

  // Add Title
  if (template.title) {
    rows.push([template.title]);
    rows.push([]);
  }

  // Add Notes
  if (template.metadata?.notes) {
    rows.push([template.metadata.notes]);
    rows.push([]);
  }

  // Iterate through sections
  template.sections?.forEach((section: any) => {
    if (!section) return;

    rows.push([section.name]);
    
    // Collect unique headers from rows and totals within the current section only
    const headersSet = new Set<string>();
    section.rows?.forEach((row: any) => {
      Object.keys(row).forEach(key => headersSet.add(key));
    });
    if (section.totals) {
      Object.keys(section.totals).forEach(key => headersSet.add(key));
    }

    const headers = Array.from(headersSet);
    rows.push(headers);

    // Populate rows
    section.rows?.forEach((row: any) => {
      const rowData = headers.map(header => row[header] || '');
      rows.push(rowData);
    });

    // Add totals, if any
    if (section.totals) {
      const totalRow = headers.map(header => section.totals[header] || '');
      rows.push(totalRow);
    }

    rows.push([]); // Empty line for spacing
  });

  return unparse(rows);
}

function convertCashflowToCSV(template: any) {
  const rows: Array<any> = [];
  const projection = template.cashflow?.projection || template.projection;
  if (!projection) return unparse(rows);
  
  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    rows.push([]);  // Add blank line
    rows.push([title]);
    rows.push([]); // Add blank line after header
  };

  // Helper function to format number
  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return '';
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper function to add subsection
  const addSubsection = (title: string, data: any, columns: string[]) => {
    rows.push([title]);
    rows.push(['Line Item', ...columns]);
    
    Object.entries(data).forEach(([key, values]: [string, any]) => {
      const row = [key];
      columns.forEach(col => {
        row.push(formatNumber(values[col]));
      });
      rows.push(row);
    });
    rows.push([]); // Add space after subsection
  };

  // Get columns (dates) from the template
  const columns = template.columns || [];

  // 1. Occupancy Section
  addSectionHeader('OCCUPANCY METRICS');
  if (projection.occupancy) {
    addSubsection('Property Occupancy', {
      'Multifamily Occupancy': projection.occupancy.multifamily_occupancy,
      'Commercial Occupancy': projection.occupancy.commercial_occupancy,
      'Total Property Occupancy': projection.occupancy.property_occupancy
    }, columns);
  }

  // 2. Multifamily NOI Section
  addSectionHeader('MULTIFAMILY NET OPERATING INCOME');
  if (projection.multifamily_net_operating_income) {
    const mf_noi = projection.multifamily_net_operating_income;
    
    // Revenue subsection
    addSubsection('Revenue', {
      'Rental Revenue': mf_noi.rental_revenue,
      'Vacancy Loss': mf_noi.vacancy_loss,
      'Non-Revenue Units': mf_noi.non_revenue_unit,
      'Rent Concessions': mf_noi.rent_concessions,
      'Bad Debt': mf_noi.bad_debt,
      'Other Income': mf_noi.other_income,
      'Total Revenue': mf_noi.total_revenue
    }, columns);

    // Expenses subsection
    addSubsection('Operating Expenses', {
      'Operating Expenses': mf_noi.operating_expenses,
      'Insurance': mf_noi.insurance,
      'Real Estate Taxes': mf_noi.operating_real_estate_taxes,
      'CapEx Reserve': mf_noi.capex_reserve,
      'Management Fees': mf_noi.management_fees,
      'Total Operating Expenses': mf_noi.total_operating_expenses
    }, columns);
  }

  // 3. Commercial NOI Section
  addSectionHeader('COMMERCIAL NET OPERATING INCOME');
  if (projection.commercial_net_operating_income) {
    const comm_noi = projection.commercial_net_operating_income;
    
    addSubsection('Revenue', {
      'Rental Revenue': comm_noi.rental_revenue,
      'General Vacancy': comm_noi.general_vacancy,
      'NNN Reimbursements': comm_noi.nnn_reimbursements,
      'Net Commercial Income': comm_noi.net_commercial_income
    }, columns);

    addSubsection('Operating Expenses', {
      'Operating Expenses': comm_noi.operating_expenses,
      'Insurance': comm_noi.insurance,
      'Real Estate Taxes': comm_noi.operating_real_estate_taxes,
      'Management Fees': comm_noi.management_fees,
      'Total Operating Expenses': comm_noi.total_operating_expenses
    }, columns);
  }

  // 4. Property NOI
  addSectionHeader('PROPERTY NET OPERATING INCOME');
  if (projection.property_net_operating_income) {
    addSubsection('Total Property NOI', {
      'Net Operating Income': projection.property_net_operating_income
    }, columns);
  }

  // 5. Development Costs
  addSectionHeader('DEVELOPMENT COSTS');
  if (projection.acquisition_and_closing_costs) {
    addSubsection('Acquisition & Closing Costs', projection.acquisition_and_closing_costs, columns);
  }
  if (projection.hard_costs) {
    addSubsection('Hard Costs', projection.hard_costs, columns);
  }
  if (projection.soft_costs) {
    addSubsection('Soft Costs', projection.soft_costs, columns);
  }

  // 6. Construction Loan
  addSectionHeader('CONSTRUCTION LOAN');
  if (projection.construction_loan) {
    const loan = projection.construction_loan;
    addSubsection('Loan Details', {
      'Funding': loan.funding,
      'Interest Expense': loan.interest_expense,
      'Origination Fees': loan.origination_fees,
      'Amortization': loan.amortization,
      'Repayment': loan.repayment,
      'Loan Balance': loan.loan_balance
    }, columns);
  }

  // 7. Cash Flows
  addSectionHeader('CASH FLOWS');
  if (projection.levered_cash_flows) {
    addSubsection('Project Cash Flows', {
      'Levered Cash Flow': projection.levered_cash_flows
    }, columns);
  }

  // 8. Exit Values
  addSectionHeader('EXIT VALUES');
  if (projection.exit_value) {
    const exit = projection.exit_value;
    addSubsection('Exit Valuation', {
      'Multifamily Gross Exit Value': exit.multifamily_gross_exit_value,
      'Commercial Gross Exit Value': exit.commercial_gross_exit_value,
      'Property Sales Costs': exit.property_sales_costs,
      'Net Exit Value': exit.net_exit_value
    }, columns);
  }

  // 9. Return Metrics
  if (projection.return_metrics) {
    addSectionHeader('RETURN METRICS');
    const metrics = projection.return_metrics;
    rows.push(['Metric', 'Value']);
    
    // Helper function to get the first (and usually only) value from a metric
    const getMetricValue = (metric: any) => {
      if (!metric) return '';
      const values = Object.values(metric);
      const value = values.length > 0 ? values[0] : '';
      if (typeof value === 'number' || typeof value === 'string') {
        return formatNumber(value);
      }
      return '';
    };

    rows.push(['Unlevered IRR', getMetricValue(metrics.unlevered_irr)]);
    rows.push(['Levered IRR', getMetricValue(metrics.levered_irr)]);
    rows.push(['Unlevered MOIC', getMetricValue(metrics.unlevered_moic)]);
    rows.push(['Levered MOIC', getMetricValue(metrics.levered_moic)]);
    rows.push(['Maximum Equity', getMetricValue(metrics.max_equity)]);
    rows.push(['Total Profit', getMetricValue(metrics.profit)]);
  }

  return unparse(rows);
}

// Helper function to determine if a template has actually changed
function hasTemplateChanged(
  templateType: string, 
  existingTemplates: Record<string, any> | null, 
  latestTemplates: Record<string, any>
): boolean {
  if (!existingTemplates) return true; // If no existing templates, consider it changed
  
  let existingData, latestData;
  
  // Get the appropriate template data based on type
  if (templateType === 'user_input') {
    existingData = existingTemplates.user_input_template || 
      (existingTemplates.templates && existingTemplates.templates.find((t: any) => 
        t.type === 'template_update' && t.template_type === 'user_input'
      ));
    
    latestData = latestTemplates.user_input_template || 
      (latestTemplates.templates && latestTemplates.templates.find((t: any) => 
        t.type === 'template_update' && t.template_type === 'user_input'
      ));
  } else {
    existingData = existingTemplates[`${templateType}_template`];
    latestData = latestTemplates[`${templateType}_template`];
  }
  
  // If either doesn't exist, the state has changed
  if (!existingData && latestData) return true;
  if (existingData && !latestData) return true;
  if (!existingData && !latestData) return false;
  
  // Compare the JSON stringified versions to detect changes
  return JSON.stringify(existingData) !== JSON.stringify(latestData);
}

export const requestTemplateUpdate = ({ session, dataStream, chatId }: RequestTemplateUpdateProps): Tool<typeof requestTemplateUpdateSchema, RequestTemplateUpdateResult> =>
  tool<typeof requestTemplateUpdateSchema, RequestTemplateUpdateResult>({
    parameters: requestTemplateUpdateSchema,
    execute: async ({ userQuery }) => {
      if (!session.user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        console.log('REQUEST_TEMPLATE_UPDATE - START - status: streaming');
        
        // Get initial templates state
        const existingTemplates = await getChatTemplates({ id: chatId });
        
        // Make the update
        await updateChatTemplate(chatId, userQuery, session.user.id);
        
        // Get latest templates after update
        const latestTemplates = await getChatTemplates({ id: chatId });
        
        if (!latestTemplates) {
          throw new Error('No templates found after update');
        }

        // Replace verbose logging with a more concise message
        console.log('Latest templates loaded successfully');

        // Check which templates exist and have been updated
        const templateExists = {
          user_input: Boolean(latestTemplates.user_input_template || 
            (latestTemplates.templates && latestTemplates.templates.find((t: any) => 
              t.type === 'template_update' && t.template_type === 'user_input'
            ))
          ),
          development: Boolean(latestTemplates.development_template),
          revenue: Boolean(latestTemplates.revenue_template),
          returns: Boolean(latestTemplates.returns_template),
          cashflow: Boolean(latestTemplates.cashflow_template)
        };

        // Determine which templates have actually changed
        const templateChanged = {
          user_input: hasTemplateChanged('user_input', existingTemplates, latestTemplates),
          development: hasTemplateChanged('development', existingTemplates, latestTemplates),
          revenue: hasTemplateChanged('revenue', existingTemplates, latestTemplates),
          returns: hasTemplateChanged('returns', existingTemplates, latestTemplates),
          cashflow: hasTemplateChanged('cashflow', existingTemplates, latestTemplates)
        };

        // Track changed templates for logging
        const changedTemplates: string[] = [];

        // Update template state based on what exists in DB
        const templateState = {
          user_input: templateExists.user_input,
          development: templateExists.development,
          revenue: templateExists.revenue,
          returns: templateExists.returns,
          cashflow: templateExists.cashflow
        };

        // Send template state update
        dataStream.writeData({
          type: 'template-state',
          content: JSON.stringify(templateState),
        });

        // Process each template type that exists
        for (const [templateType, exists] of Object.entries(templateExists)) {
          // Only process if the template exists AND has changed
          if (!exists || !templateChanged[templateType as keyof typeof templateChanged]) {
            continue;
          }
          
          changedTemplates.push(templateType);
          
          let templateData;
          if (templateType === 'user_input') {
            // For user input, look in templates array or user_input_template
            templateData = latestTemplates.templates?.find((t: any) => 
              t.type === 'template_update' && t.template_type === 'user_input'
            ) || latestTemplates.user_input_template;
          } else {
            // For other templates, use the _template suffix
            templateData = latestTemplates[`${templateType}_template`];
          }

          if (!templateData) continue;

          // Convert to CSV based on template type
          let rows: string[][] = [];
          let csv: string;
          
          if (templateType === 'user_input') {
            // Special handling for user input format
            rows = [['Section', 'Subsection', 'Field', 'Value']];
            
            const data = templateData.data || templateData;
            Object.entries(data).forEach(([path, value]) => {
              const parts = path.split('.');
              const section = parts[0];
              const subsection = parts.length > 2 ? parts[1] : '';
              const field = parts[parts.length - 1];
              
              rows.push([
                section.replace(/_/g, ' '),
                subsection.replace(/_/g, ' '),
                field.replace(/_/g, ' '),
                value?.toString() || ''
              ]);
            });
            csv = unparse(rows);
          } else {
            // Use existing conversion functions for other templates
            const result = convertJsonToCsv({ [`${templateType}_template`]: templateData });
            csv = result.csv;
          }

          // Check for existing documents of this type
          const existingDocs = await getDocumentsByChatId({
            chatId,
            templateType: templateType as any
          });

          const version = existingDocs.length > 0 ? 
            (existingDocs[0].metadata?.version || 0) + 1 : 1;

          // Save document with metadata
          await saveDocument({
            chatId,
            title: templateType === 'user_input' ? 'User Inputs' : 
              `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template`,
            kind: 'sheet',
            content: csv,
            metadata: {
              templateType: templateType as any,
              version,
              updatedAt: new Date().toISOString(),
              trigger: {
                messageId: 'system',
                content: userQuery
              }
            },
            userId: session.user.id
          });
        }

        console.log(`Templates changed and updated: ${changedTemplates.join(', ') || 'None'}`);
        console.log('REQUEST_TEMPLATE_UPDATE - BEFORE FINISH - status: streaming');

        dataStream.writeData({
          type: 'finish',
          content: '',
        });

        // Explicitly set status to idle to ensure UI updates correctly
        console.log('[DEBUG-SERVER] ABOUT TO SEND STATUS=IDLE EVENT');
        dataStream.writeData({
          type: 'status',
          content: JSON.stringify({ status: 'idle' }),
        });
        console.log('[DEBUG-SERVER] SENT STATUS=IDLE EVENT');

        console.log('REQUEST_TEMPLATE_UPDATE - AFTER FINISH - status should be idle but might still be streaming');

        return {
          success: true,
          message: 'Templates updated successfully',
          updatedTemplates: latestTemplates
        };
      } catch (error) {
        console.error('Error in requestTemplateUpdate:', error);
        throw error;
      }
    },
  }); 