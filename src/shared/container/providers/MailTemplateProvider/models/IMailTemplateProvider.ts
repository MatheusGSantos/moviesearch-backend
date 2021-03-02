import IParseMailTemplateDTO from '../dtos/IParseTemplateDTO';

export default interface IMailProvider {
  parse(data: IParseMailTemplateDTO): Promise<string>;
}
