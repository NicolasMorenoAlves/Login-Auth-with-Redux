import {Request,Response} from 'express'
import jwt from 'jsonwebtoken'
import {promisify} from 'util'
import User from '../models/UserModel'
import Company from '../models/CompanyModel'
export default {
  
    async query(req:Request,res:Response){
          const {userId} = req
          const {company} = await User.findOne({_id:userId}).populate('company')
          return res.json(company)
    },

    async add(req:Request,res:Response){
      const {authorization} = req.headers
      const {name,cnpj,description} = req.body

      const company = await Company.findOne({cnpj})
          if (company)
            return res.status(505).json({error:'Empresa já existe!!'})

      const receivedToken = authorization?.split(' ')[1] as string

      try {

          const {_id} = await promisify(jwt.verify)(receivedToken,"secret");  
          const user = await User.findOne({_id})
          
          // user.company.forEach((company) => {
          //   if (company.cnpj===cnpj)
          //     return res.status(505).json({error:'Empresa ja cadastrada'})
          // })

          const newCompany = new Company({
            name,cnpj,description
          })
          const savedCompany = await newCompany.save()

          user.company.push(savedCompany._id)
          user.save()

          return res.json({company:savedCompany})

        } catch (err) {

          return res.status(401).send({error: "Token invalid"});

        } 
    }
}