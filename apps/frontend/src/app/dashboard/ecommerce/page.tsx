'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import {
  BuildingStorefrontIcon,
  PlusIcon,
  CogIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Store {
  id: string
  name: string
  platform: 'shopify' | 'woocommerce' | 'magento' | 'bigcommerce'
  status: 'connected' | 'disconnected' | 'error'
  url: string
  lastSync: string
  products: number
  orders: number
  revenue: number
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'archived'
  store: string
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  customer: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: number
  store: string
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'Construction Supply Store',
    platform: 'shopify',
    status: 'connected',
    url: 'https://construction-supply.myshopify.com',
    lastSync: '2 minutes ago',
    products: 147,
    orders: 23,
    revenue: 15420
  },
  {
    id: '2',
    name: 'Building Materials Direct',
    platform: 'woocommerce',
    status: 'connected',
    url: 'https://buildingmaterials.com',
    lastSync: '5 minutes ago',
    products: 89,
    orders: 12,
    revenue: 8950
  },
  {
    id: '3',
    name: 'Pro Tools & Equipment',
    platform: 'bigcommerce',
    status: 'error',
    url: 'https://protoolsequipment.com',
    lastSync: '2 hours ago',
    products: 234,
    orders: 0,
    revenue: 0
  }
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Hammer Drill',
    sku: 'HD-001',
    price: 299.99,
    stock: 15,
    status: 'active',
    store: 'Construction Supply Store'
  },
  {
    id: '2',
    name: 'Safety Hard Hat - Yellow',
    sku: 'SH-YLW-001',
    price: 24.99,
    stock: 45,
    status: 'active',
    store: 'Construction Supply Store'
  },
  {
    id: '3',
    name: 'Measuring Tape 25ft',
    sku: 'MT-25-001',
    price: 18.99,
    stock: 0,
    status: 'active',
    store: 'Building Materials Direct'
  }
]

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-1001',
    customer: 'ABC Construction',
    total: 1247.50,
    status: 'processing',
    date: '2025-08-13',
    items: 5,
    store: 'Construction Supply Store'
  },
  {
    id: '2',
    orderNumber: '#ORD-1002',
    customer: 'Johnson Builders',
    total: 589.99,
    status: 'shipped',
    date: '2025-08-12',
    items: 3,
    store: 'Building Materials Direct'
  },
  {
    id: '3',
    orderNumber: '#ORD-1003',
    customer: 'Modern Renovations',
    total: 234.97,
    status: 'delivered',
    date: '2025-08-11',
    items: 2,
    store: 'Construction Supply Store'
  }
]

const platformColors = {
  shopify: 'bg-green-100 text-green-800',
  woocommerce: 'bg-purple-100 text-purple-800',
  magento: 'bg-orange-100 text-orange-800',
  bigcommerce: 'bg-blue-100 text-blue-800'
}

const statusColors = {
  connected: 'bg-green-100 text-green-800',
  disconnected: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function EcommercePage() {
  const [showConnectModal, setShowConnectModal] = useState(false)

  const totalRevenue = mockStores.reduce((sum, store) => sum + store.revenue, 0)
  const totalOrders = mockStores.reduce((sum, store) => sum + store.orders, 0)
  const totalProducts = mockStores.reduce((sum, store) => sum + store.products, 0)

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Online Store Management
          </h2>
          <p className="mt-1 text-sm text-gray-700 >
            Manage your e-commerce stores, products, and orders from one central location
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Connect Store
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                12%
              </span>
              <span className="text-gray-700 > from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                8%
              </span>
              <span className="text-gray-700 > from last week</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600 font-medium flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                3%
              </span>
              <span className="text-gray-700 > from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">Connected Stores</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockStores.length}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-800">
                {mockStores.filter(s => s.status === 'connected').length} active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Grid Sections */}
      <div className="space-y-10">
        {/* Stores Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-gray-400" /> Stores
            </h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockStores.map(store => (
              <div key={store.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${platformColors[store.platform]}`}>{store.platform}</span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[store.status]}`}>{store.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-800">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-800">
                      <CogIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-blue-600 truncate mb-2">{store.url}</p>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{store.products}</p>
                    <p className="text-xs text-gray-700 >Products</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{store.orders}</p>
                    <p className="text-xs text-gray-700 >Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600">${store.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-700 >Revenue</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-auto">Last sync: {store.lastSync}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-gray-400" /> Products
            </h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                      <p className="text-xs text-gray-700 >{product.sku}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[product.status]}`}>{product.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">${product.price}</p>
                    <p className="text-xs text-gray-700 >Price</p>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock === 0 ? '0' : product.stock}</p>
                    <p className="text-xs text-gray-700 >Stock</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 text-center line-clamp-1">{product.store}</p>
                    <p className="text-xs text-gray-400">Store</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-auto">
                  <button className="text-blue-600 hover:text-blue-800">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-400" /> Recent Orders
            </h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-700 >{order.items} items • {order.date}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <p className="text-xs text-gray-800 mb-2">Customer: <span className="font-medium">{order.customer}</span></p>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-sm font-semibold text-gray-900">${order.total}</p>
                  <p className="text-xs text-gray-700 truncate max-w-[120px] text-right">{order.store}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Timeline */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" /> Recent Activity
          </h3>
          <div className="bg-white shadow rounded-lg p-6">
            <ul className="space-y-6">
              <li className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800"><span className="font-medium text-gray-900">Order #ORD-1001</span> was processed</p>
                  <p className="text-xs text-gray-400 mt-0.5">2 minutes ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800"><span className="font-medium text-gray-900">5 new products</span> synced from Shopify</p>
                  <p className="text-xs text-gray-400 mt-0.5">15 minutes ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800"><span className="font-medium text-gray-900">Pro Tools & Equipment</span> connection error</p>
                  <p className="text-xs text-gray-400 mt-0.5">2 hours ago</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Connect Store Modal */}
  {showConnectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connect New Store</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">Shopify</p>
                    </div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium">WooCommerce</p>
                    </div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm font-medium">Magento</p>
                    </div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">BigCommerce</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  )
}
