import { DocumentHandler } from './server';
import textDocumentHandler from '@/artifacts/text/server';
import codeDocumentHandler from '@/artifacts/code/server';
import imageDocumentHandler from '@/artifacts/image/server';
import sheetDocumentHandler from '@/artifacts/sheet/server';

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
]; 