import { ipcMain } from "electron";
import { Level } from "../entities";

const fetchLevels = () => {
  const repository = Level.getRepository();
  return repository
    .createQueryBuilder("level")
    .orderBy("level.name", "ASC")
    .getMany();
};

const editLevel = async (_: Electron.IpcMainInvokeEvent, edited: Level) => {
  const repository = Level.getRepository();
  const level = await Level.findOneOrFail({
    where: { id: edited.id },
  });
  level.name = edited.name;
  const updatedLevel = await repository.save(level);
  return updatedLevel;
};

const deleteLevel = async (_: Electron.IpcMainInvokeEvent, levelId: number) => {
  return await Level.delete(levelId);
};

export const setUpLevelAPI = () => {
  ipcMain.handle("fetch-levels", fetchLevels);
  ipcMain.handle("edit-level", editLevel);
  ipcMain.handle("delete-level", deleteLevel);
};
