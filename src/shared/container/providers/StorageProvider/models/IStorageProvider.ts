export default interface IStorageProvider {
  saveFile(File: string): Promise<string>;
  deleteFile(File: string): Promise<void>;
}
