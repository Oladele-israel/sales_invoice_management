import { Controller, Param, Delete } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller('file')
export class FileUploadController {
  constructor(private fileService: FileUploadService) {}

  @Delete('delete/:fileId')
  deleteFile(@Param('fileId') fileId: string) {
    return this.fileService.deleteFile(fileId);
  }
}
