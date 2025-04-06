import { DocumentHandler } from './server';
import textDocumentHandler from '@/artifacts/text/server';
import codeDocumentHandler from '@/artifacts/code/server';
import imageDocumentHandler from '@/artifacts/image/server';
import sheetDocumentHandler from '@/artifacts/sheet/server';
import { financialDocumentHandler } from '@/artifacts/financial/server';

/**
 * Registry of all document handlers by artifact kind
 */
export const documentHandlersByArtifactKind = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
  financialDocumentHandler
]; 