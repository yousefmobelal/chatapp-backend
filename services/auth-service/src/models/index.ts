import { sequelize } from '@/config/sequelize';
import { UserCredentials } from '@/models/user-credentails.model';
import { RefreshToken } from '@/models/refresh-token.model';

export const initModels = async () => {
  await sequelize.sync();
};

export { UserCredentials, RefreshToken };
