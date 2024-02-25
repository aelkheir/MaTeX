import { ipcMain } from "electron";
import { Unit } from "../entities/Unit";
import { Course } from "../entities";

const fetchUnits = () => {
  const repository = Unit.getRepository();
  return repository
    .createQueryBuilder("unit")
    .orderBy("unit.id", "ASC")
    .getMany();
};

const fetchUnit = (_: Electron.IpcMainInvokeEvent, unitId: number) => {
  const repository = Unit.getRepository();
  return repository
    .createQueryBuilder("unit")
    .where("unit.id = :unitId", { unitId })
    .leftJoinAndSelect("unit.lessons", "lessons")
    .getOneOrFail();
};

const addUnit = async (
  _: Electron.IpcMainInvokeEvent,
  courseId: number,
  name: string
) => {
  const course = await Course.findOneOrFail({ where: { id: courseId } });
  const repository = Unit.getRepository();
  const unit = repository.save(repository.create({ name, course }));
  return unit;
};

const editUnit = async (_: Electron.IpcMainInvokeEvent, edited: Unit) => {
  const repository = Unit.getRepository();
  const unit = await Unit.findOneOrFail({
    where: { id: edited.id },
  });
  unit.name = edited.name;
  const updatedUnit = await repository.save(unit);
  return updatedUnit;
};

const deleteUnit = async (_: Electron.IpcMainInvokeEvent, unitId: number) => {
  return await Unit.delete(unitId);
};

export const setUpUnitAPI = () => {
  ipcMain.handle("fetch-units", fetchUnits);
  ipcMain.handle("fetch-unit", fetchUnit);
  ipcMain.handle("add-unit", addUnit);
  ipcMain.handle("edit-unit", editUnit);
  ipcMain.handle("delete-unit", deleteUnit);
};
