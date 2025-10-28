class StaticPagesController < ApplicationController
  def top
    render json: { message: '界回（KAIKAI）API', version: '1.0' }
  end
end
